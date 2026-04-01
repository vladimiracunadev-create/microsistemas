# Workflows (multipaso)

Estas recetas agrupan varios pasos en una sola receta para casos reales.

Incluidos:

1. Deploy sitio estatico: **S3 sync + CloudFront invalidation**
2. Publicar imagen: **ECR login � build � tag � push**
3. ECS rollout: **force new deployment + observacion**
4. Lambda deploy: **update code (zip) + tail logs**
5. CloudFormation: **Change Set (modo seguro)**
6. SQS: **smoke test (send � receive)**
7. SNS: **suscribir email + publish**
8. DynamoDB: **put + get**
9. Secrets Manager: **create + get (cuidado)**
10. EC2: **stop � wait � start**

Recomendacion: ejecuta prechecks, luego comando, y usa cleanup si era PoC.
