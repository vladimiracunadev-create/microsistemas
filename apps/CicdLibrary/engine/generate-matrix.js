import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import axes from "../schemas/axes.json" with { type: "json" };
import schema from "../schemas/param-schema.json" with { type: "json" };
import presets from "../presets/presets.json" with { type: "json" };

import { applyDefaults, deepSet, nowIso } from "./utils.js";
import { renderTemplate } from "./vm.js";
import { evaluateRequirements, requiredSecrets, nonYamlSettings } from "./rules.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function argFlag(name) { return process.argv.includes(name); }
function ensureOutDir() {
  const outDir = path.join(repoRoot, "out");
  fs.mkdirSync(outDir, { recursive: true });
  return outDir;
}

function buildBaseConfig() {
  const cfg = {};
  applyDefaults(schema, cfg);
  cfg.project = cfg.project ?? {};
  cfg.triggers = cfg.triggers ?? {};
  cfg.env = cfg.env ?? {};
  cfg.governance = cfg.governance ?? {};
  cfg.ci = cfg.ci ?? {};
  cfg.cd = cfg.cd ?? {};
  cfg.ops = cfg.ops ?? {};
  cfg.notify = cfg.notify ?? {};
  cfg.security = cfg.security ?? {};
  return cfg;
}

function applyPreset(cfg, presetName) {
  const p = presets[presetName];
  if (!p) return;
  for (const [k, v] of Object.entries(p.overrides || {})) deepSet(cfg, k, v);
}

function comboKey(c) {
  return `${c.orchestrator}:${c.stack}:${c.cdStrategy}:${c.runner}:${c.envModel}`;
}

function describeCombo(cfg) {
  const prodMode = (cfg.env?.enabled && cfg.env?.prodByTag) ? "prod por tag" : "prod por branch";
  const runner = (cfg.runner === "self-hosted") ? "runner interno" : "runner hosted";
  const cd = cfg.cd?.strategy;
  return {
    idea: "Comparar orquestadores y estrategias reales (artefacto + promoción + gobernanza).",
    runner, cd, prodMode,
    ciProduces: cfg.ci?.artifactPath,
    cdConsumes: (cd === "docker") ? "imagen docker" : "artefacto"
  };
}

function normalizeCd(cfg) {
  if (cfg.cd?.strategy === "ssh") {
    cfg.ssh = cfg.ssh ?? {};
    cfg.ssh.host = cfg.ssh.host ?? "10.0.0.10";
    cfg.ssh.user = cfg.ssh.user ?? "deploy";
    cfg.ssh.remotePath = cfg.ssh.remotePath ?? "/var/www/app";
    cfg.ssh.restartCmd = cfg.ssh.restartCmd ?? "sudo systemctl restart app";
  }
  if (cfg.cd?.strategy === "docker") {
    cfg.docker = cfg.docker ?? {};
    cfg.docker.image = cfg.docker.image ?? "ghcr.io/org/app";
    cfg.docker.remoteCmd = cfg.docker.remoteCmd ?? "docker compose pull && docker compose up -d";
  }
  if (cfg.cd?.strategy === "s3") {
    cfg.s3 = cfg.s3 ?? {};
    cfg.s3.bucket = cfg.s3.bucket ?? "s3://mi-bucket";
  }
}

function normalizeStack(cfg, stack) {
  if (stack === "node") {
    cfg.ci.install = "npm ci";
    cfg.ci.test = "npm test";
    cfg.ci.build = "npm run build";
    cfg.ci.artifactPath = "dist/";
  } else if (stack === "python") {
    cfg.ci.install = "pip install -r requirements.txt";
    cfg.ci.test = "pytest -q";
    cfg.ci.build = "python -c \"print('build ok')\"";
    cfg.ci.artifactPath = "dist/";
  } else if (stack === "php") {
    cfg.ci.install = "composer install --no-interaction --prefer-dist";
    cfg.ci.test = "php -v";
    cfg.ci.build = "php -r \"echo 'build ok';\"";
    cfg.ci.artifactPath = "public/";
  } else if (stack === "docker") {
    cfg.ci.install = "echo 'skip'";
    cfg.ci.test = "echo 'skip'";
    cfg.ci.build = "docker build -t app:ci .";
    cfg.ci.artifactPath = "dist/";
  }
}

function listCombos() {
  const combos = [];
  for (const orchestrator of axes.orchestrator) {
    for (const stack of axes.stack) {
      for (const cdStrategy of axes.cdStrategy) {
        for (const runner of axes.runner) {
          for (const envModel of axes.envModel) {
            combos.push({ orchestrator, stack, cdStrategy, runner, envModel });
          }
        }
      }
    }
  }
  return combos;
}

function writeJSON(outDir, name, obj) {
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(obj, null, 2), "utf8");
}

function main() {
  const full = argFlag("--full");
  const outDir = ensureOutDir();
  const combos = listCombos();

  const matrix = [];
  const matrixFull = [];

  for (const combo of combos) {
    const cfg = buildBaseConfig();
    applyPreset(cfg, "private-ssh");

    cfg.orchestrator = combo.orchestrator;
    cfg.stack = combo.stack;
    cfg.runner = combo.runner;

    // envModel axis
    if (combo.envModel === "single") {
      cfg.env.enabled = false;
    } else {
      cfg.env.enabled = true;
      cfg.env.stagingBranch = cfg.env.stagingBranch ?? "develop";
      cfg.env.prodByTag = cfg.env.prodByTag ?? true;
      cfg.env.approvalProd = cfg.env.approvalProd ?? true;
    }

    // CD axis
    cfg.cd.strategy = combo.cdStrategy;

    normalizeStack(cfg, combo.stack);
    normalizeCd(cfg);

    cfg.project.name = `case-${comboKey(combo).replace(/[:]/g, "-")}`;
    cfg.project.branch = "main";
    cfg.project.focus = "Caso generado por matriz (aprendizaje).";

    const key = comboKey(combo);
    const req = evaluateRequirements(cfg);
    const secrets = requiredSecrets(cfg);
    const nonYaml = nonYamlSettings(combo.orchestrator, cfg);

    const outputs = {
      github: [".github/workflows/ci-cd.yml"],
      gitlab: [".gitlab-ci.yml"],
      jenkins: ["Jenkinsfile"],
      hooks: ["hooks/post-receive"]
    }[combo.orchestrator];

    matrix.push({
      key,
      combo,
      description: describeCombo(cfg),
      requirements: req,
      requiredSecrets: secrets,
      nonYamlSettings: nonYaml,
      outputs
    });

    if (full) {
      const { outPath, content } = renderTemplate(fs, cfg);

      const blueprint = [
        `# ${cfg.project.name}`,
        ``,
        `## Enfoque`,
        cfg.project.focus,
        ``,
        `## Combo`,
        `- orchestrator: ${combo.orchestrator}`,
        `- stack: ${combo.stack}`,
        `- cdStrategy: ${combo.cdStrategy}`,
        `- runner: ${combo.runner}`,
        `- envModel: ${combo.envModel}`,
        ``,
        `## Requerimientos (inputs)`,
        req.map(x => `- ${x}`).join("\n"),
        ``,
        `## Secrets requeridos`,
        secrets.map(x => `- ${x}`).join("\n"),
        ``,
        `## Config fuera de YAML`,
        nonYaml.length ? nonYaml.map(x => `- ${x}`).join("\n") : "- (n/a)",
        ``
      ].join("\n");

      matrixFull.push({
        key,
        combo,
        config: cfg,
        rendered: [
          { path: outPath, content },
          { path: "BLUEPRINT.md", content: blueprint }
        ]
      });
    }
  }

  const meta = {
    version: "1.0.0",
    generatedAt: nowIso(),
    counts: {
      orchestrator: axes.orchestrator.length,
      stack: axes.stack.length,
      cdStrategy: axes.cdStrategy.length,
      runner: axes.runner.length,
      envModel: axes.envModel.length,
      total: matrix.length
    }
  };

  writeJSON(outDir, "matrix.json", { meta, combinations: matrix });
  if (full) writeJSON(outDir, "matrix-full.json", { meta, combinations: matrixFull });

  console.log(`[OK] out/matrix.json${full ? " + out/matrix-full.json" : ""}`);
}

main();
