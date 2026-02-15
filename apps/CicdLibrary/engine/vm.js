import Mustache from "mustache";
import { evaluateRequirements, requiredSecrets, nonYamlSettings } from "./rules.js";

export const TEMPLATE_MAP = {
  github: ["templates/github/actions-ci-cd.yml.mustache", ".github/workflows/ci-cd.yml"],
  gitlab: ["templates/gitlab/.gitlab-ci.yml.mustache", ".gitlab-ci.yml"],
  jenkins: ["templates/jenkins/Jenkinsfile.mustache", "Jenkinsfile"],
  hooks: ["templates/hooks/post-receive.mustache", "hooks/post-receive"]
};

export function buildGithubOn(cfg) {
  const branch = cfg.project?.branch ?? "main";
  const branches = [];
  if (cfg.env?.enabled) {
    branches.push(cfg.env?.stagingBranch ?? "develop");
    branches.push(branch);
  } else {
    branches.push(branch);
  }

  const lines = [];
  lines.push("name: CI-CD");
  lines.push("on:");
  if (cfg.triggers?.push || cfg.triggers?.tags) {
    lines.push("  push:");
    if (cfg.triggers?.push) {
      lines.push("    branches:");
      for (const b of Array.from(new Set(branches))) lines.push(`      - \"${b}\"`);
    }
    if (cfg.triggers?.tags) {
      lines.push("    tags:");
      lines.push(`      - \"${cfg.triggers.tagPattern ?? "v*"}\"`);
    }
  }
  if (cfg.triggers?.pr) {
    lines.push("  pull_request:");
    lines.push("    branches:");
    for (const b of Array.from(new Set(branches))) lines.push(`      - \"${b}\"`);
  }
  if (cfg.triggers?.schedule) {
    lines.push("  schedule:");
    lines.push(`    - cron: \"${cfg.triggers.cron ?? "0 3 * * *"}\"`);
  }
  if (cfg.triggers?.manual) lines.push("  workflow_dispatch:");
  return lines.join("\n") + "\n";
}

export function buildHealthcheckBlock(cfg) {
  if (!cfg.ops?.healthcheck) return "";
  const url = cfg.ops.healthcheckUrl ?? "http://localhost/health";
  return [
    "      - name: Healthcheck",
    "        shell: bash",
    "        run: |",
    "          set -euo pipefail",
    `          curl -fsS \"${url}\" >/dev/null`,
  ].join("\n") + "\n";
}

export function buildVM(cfg) {
  const orchestrator = cfg.orchestrator;
  const vm = JSON.parse(JSON.stringify(cfg)); // clone
  vm.runner_label = (cfg.runner === "self-hosted") ? "self-hosted" : "ubuntu-latest";

  vm.is_ssh = cfg.cd?.strategy === "ssh";
  vm.is_docker = cfg.cd?.strategy === "docker";
  vm.is_s3 = cfg.cd?.strategy === "s3";

  vm.github_on = (orchestrator === "github") ? buildGithubOn(cfg) : "";
  vm.healthcheck_block = (orchestrator === "github") ? buildHealthcheckBlock(cfg) : "";

  // IF conditions (didáctico)
  const branch = cfg.project?.branch ?? "main";
  const stagingBranch = cfg.env?.stagingBranch ?? "develop";
  vm.staging_if = cfg.env?.enabled ? `github.ref == 'refs/heads/${stagingBranch}'` : "false";
  vm.prod_if = (cfg.env?.enabled && cfg.env?.prodByTag) ? "startsWith(github.ref, 'refs/tags/')" : `github.ref == 'refs/heads/${branch}'`;

  vm.__requirements = evaluateRequirements(cfg);
  vm.__secrets = requiredSecrets(cfg);
  vm.__nonYaml = nonYamlSettings(orchestrator, cfg);

  return vm;
}

export function renderTemplate(fs, cfg) {
  const [tplPath, outPath] = TEMPLATE_MAP[cfg.orchestrator];
  const tpl = fs.readFileSync(tplPath, "utf8");
  const vm = buildVM(cfg);
  const content = Mustache.render(tpl, vm);
  return { outPath, content, vm };
}
