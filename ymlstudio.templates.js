/* global jsyaml */
/**
 * Templates catalog: cada plantilla puede generar 1 o N archivos.
 * - id, category, title, description
 * - output(values): [{ path, content, language }]
 * - fields: [{ id, label, type, default, ... }]
 */

function slug(s){
  return String(s||"").trim().toLowerCase()
    .replace(/[^a-z0-9-_]+/g,"-")
    .replace(/-+/g,"-")
    .replace(/^-|-$/g,"") || "default";
}
function lines(s){ return String(s||"").split(/\r?\n/).map(x=>x.trim()); }
function kvLines(s){
  const obj={};
  for(const line of lines(s)){
    if(!line) continue;
    const idx=line.indexOf("=");
    if(idx<1) continue;
    const k=line.slice(0,idx).trim();
    const v=line.slice(idx+1).trim();
    if(k) obj[k]=v;
  }
  return obj;
}
function yamlDump(obj){
  return jsyaml.dump(obj,{
    indent:2,
    lineWidth:120,
    noRefs:true,
    quotingType:'"'
  }).trim()+"\n";
}
function mkFile(path, content){
  return { path, content, language: "yaml" };
}

const CATEGORIES = [
  { id:"cicd", name:"CI/CD (GitHub Actions)" },
  { id:"docker", name:"Docker / Compose" },
  { id:"aws", name:"AWS (Amplify / IaC)" },
  { id:"k8s", name:"Kubernetes / GitOps" },
  { id:"repo", name:"Repo Mantenimiento" },
  { id:"obs", name:"Observabilidad" },
  { id:"app", name:"Config App" },
  { id:"docs", name:"Docs / Sitios" }
];

const TEMPLATES = [
  // ---------------- CI/CD (GitHub Actions) ----------------
  {
    id:"gha_ci_node",
    category:"cicd",
    title:"CI Node.js (push/PR)",
    description:"Corre install + tests (y opcional build) en cada push o PR. Útil para validar calidad antes de merge.",
    fields:[
      {id:"file", label:"Nombre del workflow (archivo)", type:"string", default:"ci-node"},
      {id:"name", label:"Nombre visible", type:"string", default:"CI Node"},
      {id:"branch", label:"Rama principal", type:"string", default:"main"},
      {id:"node", label:"Versión Node", type:"string", default:"20"},
      {id:"install", label:"Comando install", type:"string", default:"npm ci"},
      {id:"test", label:"Comando test", type:"string", default:"npm test"},
      {id:"build", label:"Comando build (opcional)", type:"string", default:"npm run build"},
      {id:"do_build", label:"Ejecutar build", type:"boolean", default:true}
    ],
    output:(v)=>{
      const steps = [
        { uses:"actions/checkout@v4" },
        { uses:"actions/setup-node@v4", with:{ "node-version": String(v.node) } },
        { name:"Install", run: v.install },
        { name:"Test", run: v.test }
      ];
      if(v.do_build) steps.push({ name:"Build", run: v.build });

      const wf = {
        name: v.name,
        on: { push:{ branches:[v.branch] }, pull_request:{ branches:[v.branch] } },
        jobs: {
          build: { "runs-on":"ubuntu-latest", steps }
        }
      };

      return [ mkFile(`.github/workflows/${slug(v.file)}.yml`, yamlDump(wf)) ];
    }
  },

  {
    id:"gha_ci_php",
    category:"cicd",
    title:"CI PHP (Composer + tests)",
    description:"Pipeline para PHP: instala PHP, corre composer install y tests. Ideal para proyectos PHP 8.x.",
    fields:[
      {id:"file", label:"Nombre del workflow (archivo)", type:"string", default:"ci-php"},
      {id:"name", label:"Nombre visible", type:"string", default:"CI PHP"},
      {id:"branch", label:"Rama principal", type:"string", default:"main"},
      {id:"php", label:"Versión PHP", type:"string", default:"8.3"},
      {id:"composer_install", label:"Comando composer install", type:"string", default:"composer install --no-interaction --prefer-dist"},
      {id:"test", label:"Comando tests", type:"string", default:"vendor/bin/phpunit"}
    ],
    output:(v)=>{
      const wf = {
        name: v.name,
        on: { push:{ branches:[v.branch] }, pull_request:{ branches:[v.branch] } },
        jobs: {
          build: {
            "runs-on":"ubuntu-latest",
            steps: [
              { uses:"actions/checkout@v4" },
              { name:"Setup PHP", uses:"shivammathur/setup-php@v2", with:{ "php-version": String(v.php) } },
              { name:"Composer Install", run: v.composer_install },
              { name:"Tests", run: v.test }
            ]
          }
        }
      };
      return [ mkFile(`.github/workflows/${slug(v.file)}.yml`, yamlDump(wf)) ];
    }
  },

  {
    id:"gha_matrix_node",
    category:"cicd",
    title:"CI Node Matrix (18/20)",
    description:"Prueba tu proyecto en varias versiones de Node en paralelo (matriz).",
    fields:[
      {id:"file", label:"Nombre del workflow (archivo)", type:"string", default:"ci-matrix-node"},
      {id:"name", label:"Nombre visible", type:"string", default:"CI Matrix Node"},
      {id:"branch", label:"Rama principal", type:"string", default:"main"},
      {id:"nodes", label:"Versiones Node (1 por línea)", type:"multiline", default:"18\n20"},
      {id:"install", label:"Comando install", type:"string", default:"npm ci"},
      {id:"test", label:"Comando test", type:"string", default:"npm test"}
    ],
    output:(v)=>{
      const wf = {
        name: v.name,
        on: { push:{ branches:[v.branch] }, pull_request:{ branches:[v.branch] } },
        jobs: {
          test: {
            "runs-on":"ubuntu-latest",
            strategy: { matrix: { node: lines(v.nodes).filter(Boolean) } },
            steps: [
              { uses:"actions/checkout@v4" },
              { uses:"actions/setup-node@v4", with:{ "node-version": "${{ matrix.node }}" } },
              { name:"Install", run: v.install },
              { name:"Test", run: v.test }
            ]
          }
        }
      };
      return [ mkFile(`.github/workflows/${slug(v.file)}.yml`, yamlDump(wf)) ];
    }
  },

  {
    id:"gha_docker_publish_ghcr",
    category:"cicd",
    title:"Docker Publish a GHCR (tag/branch)",
    description:"Construye imagen Docker y la publica en GitHub Container Registry (GHCR). Útil para CD por imágenes.",
    fields:[
      {id:"file", label:"Nombre del workflow (archivo)", type:"string", default:"docker-publish"},
      {id:"name", label:"Nombre visible", type:"string", default:"Docker Publish"},
      {id:"branch", label:"Rama build (push)", type:"string", default:"main"},
      {id:"image", label:"Nombre imagen (repo)", type:"string", default:"ghcr.io/OWNER/REPO"},
      {id:"dockerfile", label:"Ruta Dockerfile", type:"string", default:"Dockerfile"},
      {id:"context", label:"Build context", type:"string", default:"."}
    ],
    output:(v)=>{
      const wf = {
        name: v.name,
        on: { push:{ branches:[v.branch] }, workflow_dispatch:{} },
        permissions: { contents:"read", packages:"write" },
        jobs: {
          build: {
            "runs-on":"ubuntu-latest",
            steps: [
              { uses:"actions/checkout@v4" },
              { name:"Login GHCR", uses:"docker/login-action@v3", with:{
                registry:"ghcr.io",
                username:"${{ github.actor }}",
                password:"${{ secrets.GITHUB_TOKEN }}"
              }},
              { name:"Build & Push", uses:"docker/build-push-action@v6", with:{
                context: v.context,
                file: v.dockerfile,
                push: true,
                tags: `${v.image}:latest`
              }}
            ]
          }
        }
      };
      return [ mkFile(`.github/workflows/${slug(v.file)}.yml`, yamlDump(wf)) ];
    }
  },

  {
    id:"gha_deploy_ssh_compose",
    category:"cicd",
    title:"Deploy por SSH + Docker Compose",
    description:"CD simple: al hacer push a main, se conecta al servidor y corre docker compose pull/up. Requiere secrets SSH.",
    fields:[
      {id:"file", label:"Nombre del workflow (archivo)", type:"string", default:"deploy-ssh-compose"},
      {id:"name", label:"Nombre visible", type:"string", default:"Deploy SSH Compose"},
      {id:"branch", label:"Rama deploy", type:"string", default:"main"},
      {id:"server_path", label:"Ruta del proyecto en servidor", type:"string", default:"/opt/manzana-app"},
      {id:"compose_cmd", label:"Comando compose (en servidor)", type:"string", default:"docker compose pull && docker compose up -d"},
      {id:"health_cmd", label:"Comando healthcheck opcional", type:"string", default:"docker ps"}
    ],
    output:(v)=>{
      const wf = {
        name: v.name,
        on: { push:{ branches:[v.branch] }, workflow_dispatch:{} },
        jobs: {
          deploy: {
            "runs-on":"ubuntu-latest",
            steps: [
              { uses:"actions/checkout@v4" },
              {
                name:"Deploy via SSH",
                uses:"appleboy/ssh-action@v1.0.3",
                with:{
                  host:"${{ secrets.SSH_HOST }}",
                  username:"${{ secrets.SSH_USER }}",
                  key:"${{ secrets.SSH_KEY }}",
                  script: [
                    `cd ${v.server_path}`,
                    `git pull --rebase`,
                    v.compose_cmd,
                    v.health_cmd
                  ].join("\n")
                }
              }
            ]
          }
        }
      };
      return [ mkFile(`.github/workflows/${slug(v.file)}.yml`, yamlDump(wf)) ];
    }
  },

  {
    id:"gha_pages_static",
    category:"cicd",
    title:"GitHub Pages (sitio estático)",
    description:"Publica un sitio estático (o build) en GitHub Pages al hacer push a main.",
    fields:[
      {id:"file", label:"Nombre del workflow (archivo)", type:"string", default:"pages"},
      {id:"name", label:"Nombre visible", type:"string", default:"Deploy Pages"},
      {id:"branch", label:"Rama", type:"string", default:"main"},
      {id:"build", label:"Comando build (opcional)", type:"string", default:""},
      {id:"dist", label:"Carpeta a publicar", type:"string", default:"."}
    ],
    output:(v)=>{
      const steps = [
        { uses:"actions/checkout@v4" }
      ];
      if(String(v.build||"").trim()){
        steps.push({ name:"Build", run: v.build });
      }
      steps.push(
        { name:"Configure Pages", uses:"actions/configure-pages@v5" },
        { name:"Upload artifact", uses:"actions/upload-pages-artifact@v3", with:{ path: v.dist } }
      );

      const wf = {
        name: v.name,
        on: { push:{ branches:[v.branch] }, workflow_dispatch:{} },
        permissions: { contents:"read", pages:"write", "id-token":"write" },
        concurrency: { group:"pages", "cancel-in-progress": true },
        jobs:{
          build:{
            "runs-on":"ubuntu-latest",
            steps
          },
          deploy:{
            needs:"build",
            "runs-on":"ubuntu-latest",
            environment:{ name:"github-pages", url:"${{ steps.deployment.outputs.page_url }}" },
            steps:[
              { name:"Deploy", id:"deployment", uses:"actions/deploy-pages@v4" }
            ]
          }
        }
      };

      return [ mkFile(`.github/workflows/${slug(v.file)}.yml`, yamlDump(wf)) ];
    }
  },

  {
    id:"gha_cron_nightly",
    category:"cicd",
    title:"Workflow programado (cron nightly)",
    description:"Ejecuta tareas nocturnas (ej: tests, backups, reportes).",
    fields:[
      {id:"file", label:"Nombre del workflow (archivo)", type:"string", default:"nightly"},
      {id:"name", label:"Nombre visible", type:"string", default:"Nightly"},
      {id:"cron", label:"Cron (UTC)", type:"string", default:"0 3 * * *"},
      {id:"commands", label:"Comandos (1 por línea)", type:"multiline", default:"echo \"Nightly 🍎\"\ndate"}
    ],
    output:(v)=>{
      const wf = {
        name: v.name,
        on: { schedule:[{ cron: v.cron }], workflow_dispatch:{} },
        jobs:{
          run:{
            "runs-on":"ubuntu-latest",
            steps:[
              { uses:"actions/checkout@v4" },
              ...lines(v.commands).filter(Boolean).map((c,i)=>({ name:`Paso ${i+1}`, run:c }))
            ]
          }
        }
      };
      return [ mkFile(`.github/workflows/${slug(v.file)}.yml`, yamlDump(wf)) ];
    }
  },

  // ---------------- Docker / Compose ----------------
  {
    id:"compose_single",
    category:"docker",
    title:"Docker Compose: 1 servicio web",
    description:"Stack mínimo para levantar un contenedor (útil para demos).",
    fields:[
      {id:"service", label:"Nombre servicio", type:"string", default:"manzana-web"},
      {id:"image", label:"Imagen", type:"string", default:"nginx:alpine"},
      {id:"ports", label:"Puertos HOST:CONT (1 por línea)", type:"multiline", default:"8080:80"},
      {id:"env", label:"Env KEY=VALUE (1 por línea)", type:"multiline", default:"APP_NAME=manzana\nAPP_ENV=dev"}
    ],
    output:(v)=>{
      const obj = {
        services:{
          [v.service]:{
            image: v.image,
            ports: lines(v.ports).filter(Boolean),
            environment: kvLines(v.env)
          }
        }
      };
      return [ mkFile(`docker-compose.yml`, yamlDump(obj)) ];
    }
  },

  {
    id:"compose_web_db_mysql",
    category:"docker",
    title:"Compose: web + MySQL + Adminer",
    description:"Entorno dev clásico: app + base de datos + adminer. Perfecto para trabajar local.",
    fields:[
      {id:"web", label:"Servicio web", type:"string", default:"manzana-app"},
      {id:"web_image", label:"Imagen web", type:"string", default:"nginx:alpine"},
      {id:"web_ports", label:"Puertos web HOST:CONT", type:"multiline", default:"8080:80"},
      {id:"db", label:"Servicio DB", type:"string", default:"manzana-db"},
      {id:"db_image", label:"Imagen DB", type:"string", default:"mysql:8.0"},
      {id:"db_name", label:"DB name", type:"string", default:"manzana"},
      {id:"db_user", label:"DB user", type:"string", default:"manzana"},
      {id:"db_pass", label:"DB pass", type:"string", default:"manzana"},
      {id:"db_root", label:"DB root pass", type:"string", default:"rootpass"},
      {id:"adminer_port", label:"Adminer port", type:"string", default:"8081"}
    ],
    output:(v)=>{
      const obj = {
        services:{
          [v.web]:{
            image: v.web_image,
            ports: lines(v.web_ports).filter(Boolean),
            depends_on: [v.db]
          },
          [v.db]:{
            image: v.db_image,
            environment:{
              MYSQL_DATABASE: v.db_name,
              MYSQL_USER: v.db_user,
              MYSQL_PASSWORD: v.db_pass,
              MYSQL_ROOT_PASSWORD: v.db_root
            },
            volumes:[ "db_data:/var/lib/mysql" ]
          },
          adminer:{
            image:"adminer",
            ports:[ `${String(v.adminer_port).trim()}:8080` ],
            depends_on:[v.db]
          }
        },
        volumes:{ db_data:{} }
      };
      return [ mkFile(`docker-compose.yml`, yamlDump(obj)) ];
    }
  },

  {
    id:"compose_php_nginx_mysql",
    category:"docker",
    title:"Compose: Nginx + PHP-FPM + MySQL (PHP moderno/legacy)",
    description:"Stack típico PHP: Nginx proxy -> php-fpm + MySQL. Base sólida para migraciones.",
    fields:[
      {id:"project", label:"Nombre proyecto", type:"string", default:"manzana-php"},
      {id:"php_image", label:"Imagen PHP-FPM", type:"string", default:"php:8.3-fpm"},
      {id:"nginx_image", label:"Imagen Nginx", type:"string", default:"nginx:alpine"},
      {id:"db_image", label:"Imagen MySQL", type:"string", default:"mysql:8.0"},
      {id:"port", label:"Puerto HTTP host", type:"string", default:"8080"}
    ],
    output:(v)=>{
      const compose = {
        services:{
          nginx:{
            image:v.nginx_image,
            ports:[ `${String(v.port).trim()}:80` ],
            volumes:[
              "./app:/var/www/html",
              "./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro"
            ],
            depends_on:["php"]
          },
          php:{
            image:v.php_image,
            volumes:["./app:/var/www/html"]
          },
          db:{
            image:v.db_image,
            environment:{
              MYSQL_DATABASE:"manzana",
              MYSQL_USER:"manzana",
              MYSQL_PASSWORD:"manzana",
              MYSQL_ROOT_PASSWORD:"rootpass"
            },
            volumes:["db_data:/var/lib/mysql"]
          }
        },
        volumes:{ db_data:{} }
      };

      const nginxConf = `
server {
  listen 80;
  server_name localhost;
  root /var/www/html;
  index index.php index.html;

  location / {
    try_files $uri $uri/ /index.php?$query_string;
  }

  location ~ \\.php$ {
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_pass php:9000;
  }
}
`.trim()+"\n";

      return [
        mkFile(`docker-compose.yml`, yamlDump(compose)),
        { path:`docker/nginx/default.conf`, content:nginxConf, language:"text" }
      ];
    }
  },

  // ---------------- AWS ----------------
  {
    id:"amplify_vite",
    category:"aws",
    title:"AWS Amplify: Vite (npm)",
    description:"Amplify Hosting: instala dependencias, build y publica carpeta dist/ en cada push a la rama conectada.",
    fields:[
      {id:"base", label:"Artifacts baseDirectory", type:"string", default:"dist"},
      {id:"install", label:"Install command", type:"string", default:"npm ci"},
      {id:"build", label:"Build command", type:"string", default:"npm run build"},
      {id:"cache", label:"Cache paths (1 por línea)", type:"multiline", default:"node_modules/.cache\n~/.npm"}
    ],
    output:(v)=>{
      const obj = {
        version: 1,
        frontend:{
          phases:{
            preBuild:{ commands:[v.install] },
            build:{ commands:[v.build] }
          },
          artifacts:{ baseDirectory:v.base, files:["**/*"] },
          cache:{ paths: lines(v.cache).filter(Boolean) }
        }
      };
      return [ mkFile(`amplify.yml`, yamlDump(obj)) ];
    }
  },

  {
    id:"cfn_s3_bucket",
    category:"aws",
    title:"CloudFormation: S3 Bucket (simple)",
    description:"Infra como código: crea un bucket S3. Base para sitios estáticos o almacenamiento.",
    fields:[
      {id:"stack_name", label:"Nombre lógico", type:"string", default:"ManzanaBucket"},
      {id:"bucket_name", label:"BucketName (opcional)", type:"string", default:""}
    ],
    output:(v)=>{
      const res = {};
      const props = {};
      if(String(v.bucket_name||"").trim()) props.BucketName = v.bucket_name.trim();
      res[v.stack_name] = { Type:"AWS::S3::Bucket", Properties: props };
      const obj = {
        AWSTemplateFormatVersion:"2010-09-09",
        Description:"Stack Manzana - S3 Bucket",
        Resources: res
      };
      return [ mkFile(`cfn/template.yml`, yamlDump(obj)) ];
    }
  },

  {
    id:"sam_lambda_api",
    category:"aws",
    title:"AWS SAM: Lambda + API (Hello)",
    description:"Serverless básico: Lambda con endpoint HTTP. Útil como backend liviano.",
    fields:[
      {id:"fn_name", label:"Nombre función", type:"string", default:"ManzanaFn"},
      {id:"runtime", label:"Runtime", type:"string", default:"nodejs20.x"},
      {id:"path", label:"Path", type:"string", default:"/manzana"},
      {id:"method", label:"Method", type:"string", default:"GET"}
    ],
    output:(v)=>{
      const obj = {
        Transform:"AWS::Serverless-2016-10-31",
        Description:"Manzana API (SAM)",
        Resources:{
          [v.fn_name]:{
            Type:"AWS::Serverless::Function",
            Properties:{
              Runtime:v.runtime,
              Handler:"index.handler",
              InlineCode:"exports.handler=async()=>({statusCode:200,body:'🍎 manzana'})",
              Events:{
                Api:{
                  Type:"HttpApi",
                  Properties:{ Path:v.path, Method:v.method }
                }
              }
            }
          }
        }
      };
      return [ mkFile(`sam/template.yml`, yamlDump(obj)) ];
    }
  },

  // ---------------- Kubernetes / GitOps ----------------
  {
    id:"k8s_deploy_service",
    category:"k8s",
    title:"K8s: Deployment + Service",
    description:"Manifiestos base para correr una app en Kubernetes (replicas + service).",
    fields:[
      {id:"name", label:"Nombre app", type:"string", default:"manzana"},
      {id:"image", label:"Imagen", type:"string", default:"nginx:alpine"},
      {id:"replicas", label:"Replicas", type:"string", default:"2"},
      {id:"port", label:"ContainerPort", type:"string", default:"80"}
    ],
    output:(v)=>{
      const name = slug(v.name);
      const deploy = {
        apiVersion:"apps/v1",
        kind:"Deployment",
        metadata:{ name },
        spec:{
          replicas: Number(v.replicas),
          selector:{ matchLabels:{ app:name } },
          template:{
            metadata:{ labels:{ app:name } },
            spec:{
              containers:[{
                name,
                image:v.image,
                ports:[{ containerPort:Number(v.port) }]
              }]
            }
          }
        }
      };

      const svc = {
        apiVersion:"v1",
        kind:"Service",
        metadata:{ name:`${name}-svc` },
        spec:{
          selector:{ app:name },
          ports:[{ port:80, targetPort:Number(v.port) }]
        }
      };

      return [
        mkFile(`k8s/deployment.yml`, yamlDump(deploy)),
        mkFile(`k8s/service.yml`, yamlDump(svc))
      ];
    }
  },

  {
    id:"k8s_ingress",
    category:"k8s",
    title:"K8s: Ingress (host -> service)",
    description:"Expone tu servicio por dominio mediante Ingress (requiere controlador Ingress instalado).",
    fields:[
      {id:"host", label:"Host (dominio)", type:"string", default:"manzana.local"},
      {id:"service", label:"Service name", type:"string", default:"manzana-svc"},
      {id:"service_port", label:"Service port", type:"string", default:"80"},
      {id:"name", label:"Ingress name", type:"string", default:"manzana-ingress"}
    ],
    output:(v)=>{
      const ing = {
        apiVersion:"networking.k8s.io/v1",
        kind:"Ingress",
        metadata:{ name: slug(v.name) },
        spec:{
          rules:[{
            host:v.host,
            http:{
              paths:[{
                path:"/",
                pathType:"Prefix",
                backend:{
                  service:{ name:v.service, port:{ number:Number(v.service_port) } }
                }
              }]
            }
          }]
        }
      };
      return [ mkFile(`k8s/ingress.yml`, yamlDump(ing)) ];
    }
  },

  {
    id:"k8s_configmap",
    category:"k8s",
    title:"K8s: ConfigMap (env)",
    description:"ConfigMap para inyectar variables a tu app. (Secrets: mejor fuera del repo).",
    fields:[
      {id:"name", label:"ConfigMap name", type:"string", default:"manzana-config"},
      {id:"data", label:"DATA key=value (1 por línea)", type:"multiline", default:"APP_NAME=manzana\nAPP_ENV=prod"}
    ],
    output:(v)=>{
      const cm = {
        apiVersion:"v1",
        kind:"ConfigMap",
        metadata:{ name: slug(v.name) },
        data: kvLines(v.data)
      };
      return [ mkFile(`k8s/configmap.yml`, yamlDump(cm)) ];
    }
  },

  {
    id:"k8s_cronjob",
    category:"k8s",
    title:"K8s: CronJob",
    description:"Tarea programada dentro del cluster (ej: limpieza, reportes).",
    fields:[
      {id:"name", label:"Nombre", type:"string", default:"manzana-nightly"},
      {id:"cron", label:"Cron", type:"string", default:"0 3 * * *"},
      {id:"image", label:"Imagen", type:"string", default:"alpine:3"},
      {id:"cmd", label:"Comando", type:"string", default:"echo '🍎 cronjob' && date"}
    ],
    output:(v)=>{
      const cj = {
        apiVersion:"batch/v1",
        kind:"CronJob",
        metadata:{ name: slug(v.name) },
        spec:{
          schedule:v.cron,
          jobTemplate:{
            spec:{
              template:{
                spec:{
                  restartPolicy:"OnFailure",
                  containers:[{
                    name:"job",
                    image:v.image,
                    command:["sh","-c", v.cmd]
                  }]
                }
              }
            }
          }
        }
      };
      return [ mkFile(`k8s/cronjob.yml`, yamlDump(cj)) ];
    }
  },

  // ---------------- Repo mantenimiento ----------------
  {
    id:"dependabot_npm",
    category:"repo",
    title:"Dependabot: npm weekly",
    description:"Crea PRs automáticos para actualizar dependencias npm.",
    fields:[
      {id:"dir", label:"Directorio (ej: / o /apps/web)", type:"string", default:"/"},
      {id:"day", label:"Día", type:"string", default:"monday"}
    ],
    output:(v)=>{
      const obj = {
        version:2,
        updates:[{
          "package-ecosystem":"npm",
          directory:v.dir,
          schedule:{ interval:"weekly", day:v.day }
        }]
      };
      return [ mkFile(`.github/dependabot.yml`, yamlDump(obj)) ];
    }
  },

  {
    id:"precommit_basic",
    category:"repo",
    title:"pre-commit: hooks básicos",
    description:"Asegura limpieza antes de commitear: trailing spaces, fin de archivo, etc.",
    fields:[
      {id:"rev", label:"Rev pre-commit-hooks", type:"string", default:"v5.0.0"}
    ],
    output:(v)=>{
      const obj = {
        repos:[{
          repo:"https://github.com/pre-commit/pre-commit-hooks",
          rev:v.rev,
          hooks:[
            { id:"trailing-whitespace" },
            { id:"end-of-file-fixer" },
            { id:"check-yaml" }
          ]
        }]
      };
      return [ mkFile(`.pre-commit-config.yaml`, yamlDump(obj)) ];
    }
  },

  // ---------------- Observabilidad ----------------
  {
    id:"prometheus_basic",
    category:"obs",
    title:"Prometheus: scrape básico",
    description:"Config mínima para scrapear un target (tu app expone /metrics).",
    fields:[
      {id:"interval", label:"Scrape interval", type:"string", default:"15s"},
      {id:"job", label:"Job name", type:"string", default:"manzana"},
      {id:"target", label:"Target host:port", type:"string", default:"localhost:8080"}
    ],
    output:(v)=>{
      const obj = {
        global:{ scrape_interval:v.interval },
        scrape_configs:[{
          job_name:v.job,
          static_configs:[{ targets:[v.target] }]
        }]
      };
      return [ mkFile(`observability/prometheus.yml`, yamlDump(obj)) ];
    }
  },

  {
    id:"otel_collector_logging",
    category:"obs",
    title:"OpenTelemetry Collector: OTLP -> logging",
    description:"Recibe OTLP y exporta a logging (útil para pruebas).",
    fields:[
      {id:"grpc", label:"Puerto gRPC", type:"string", default:"4317"},
      {id:"http", label:"Puerto HTTP", type:"string", default:"4318"}
    ],
    output:(v)=>{
      const obj = {
        receivers:{ otlp:{ protocols:{ grpc:{ endpoint:`0.0.0.0:${v.grpc}` }, http:{ endpoint:`0.0.0.0:${v.http}` } } } },
        exporters:{ logging:{} },
        service:{ pipelines:{
          traces:{ receivers:["otlp"], exporters:["logging"] },
          metrics:{ receivers:["otlp"], exporters:["logging"] },
          logs:{ receivers:["otlp"], exporters:["logging"] }
        }}
      };
      return [ mkFile(`observability/otel-collector.yml`, yamlDump(obj)) ];
    }
  },

  // ---------------- App config ----------------
  {
    id:"spring_application_yml",
    category:"app",
    title:"Spring Boot: application.yml",
    description:"Config típica de aplicación (puerto + ejemplo feature flags).",
    fields:[
      {id:"port", label:"server.port", type:"string", default:"8080"},
      {id:"name", label:"app.name", type:"string", default:"manzana"},
      {id:"env", label:"app.env", type:"string", default:"dev"}
    ],
    output:(v)=>{
      const obj = { server:{ port:Number(v.port) }, app:{ name:v.name, env:v.env } };
      return [ mkFile(`src/main/resources/application.yml`, yamlDump(obj)) ];
    }
  },

  // ---------------- Docs / Sitios ----------------
  {
    id:"mkdocs_basic",
    category:"docs",
    title:"MkDocs: mkdocs.yml",
    description:"Sitio de documentación con navegación simple.",
    fields:[
      {id:"site", label:"site_name", type:"string", default:"Manual Manzana"},
      {id:"home", label:"Home (archivo)", type:"string", default:"index.md"},
      {id:"extra", label:"Página extra (archivo)", type:"string", default:"uso.md"}
    ],
    output:(v)=>{
      const obj = {
        site_name: v.site,
        nav: [
          { Inicio: v.home },
          { Uso: v.extra }
        ]
      };
      return [ mkFile(`mkdocs.yml`, yamlDump(obj)) ];
    }
  }
];

// Export global
window.YAML_STUDIO_CATEGORIES = CATEGORIES;
window.YAML_STUDIO_TEMPLATES = TEMPLATES;
