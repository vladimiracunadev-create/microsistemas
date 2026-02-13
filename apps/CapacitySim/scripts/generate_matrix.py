#!/usr/bin/env python3
import argparse
import os
import csv
import itertools
from capacity_calc import calculate, load_baselines

def main():
    """
    Genera un archivo CSV con una matriz de combinaciones de configuraciones (OS, Web Server, DB, etc.)
    y sus respectivas capacidades calculadas. Útil para análisis masivos.
    """
    p = argparse.ArgumentParser(description="Genera matriz de combinaciones y capacidad")
    p.add_argument("--preset", choices=["common","all"], default="common")
    p.add_argument("--cores_per_instance_list", default="2,4,8")
    p.add_argument("--app_replicas_list", default="1,2,4")
    p.add_argument("--db_cores_primary", type=int, default=8)
    p.add_argument("--db_replication_mode_list", default="none,read_replicas")
    p.add_argument("--db_read_replicas_list", default="0,1,2")
    p.add_argument("--read_ratio_pct_list", default="50,80,95")
    p.add_argument("--lb_mesh_list", default="none,alb_nlb,service_mesh")
    p.add_argument("--connection_pool_profile_list", default="small,default,large")
    p.add_argument("--pool_per_instance_list", default="20,50,150")
    p.add_argument("--db_conn_hard_limit_list", default="200,800,2000")
    p.add_argument("--bandwidth_mbps", type=float, default=1000.0)
    p.add_argument("--payload_kb", type=float, default=100.0)
    p.add_argument("--safety", type=float, default=0.7)
    p.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "..", "data", "matriz.csv"))
    args = p.parse_args()

    b = load_baselines()

    def ints(s): return [int(x) for x in s.split(",")]
    def floats(s): return [float(x) for x in s.split(",")]
    def strs(s): return [x.strip() for x in s.split(",")]

    cores_list = ints(args.cores_per_instance_list)
    app_rep_list = ints(args.app_replicas_list)
    db_rep_mode_list = strs(args.db_replication_mode_list)
    db_read_rep_list = ints(args.db_read_replicas_list)
    read_ratio_list = floats(args.read_ratio_pct_list)

    lb_list = strs(args.lb_mesh_list)
    pool_profile_list = strs(args.connection_pool_profile_list)
    pool_override_list = ints(args.pool_per_instance_list)
    db_hard_list = ints(args.db_conn_hard_limit_list)

    if args.preset == "common":
        os_list = ["linux"]
        web_list = ["nginx","apache"]
        runtime_list = ["node","php-fpm","python-gunicorn","java-tomcat",".net"]
        db_list = ["postgres","mysql"]
        container_list = ["none","docker"]
        orch_list = ["none","kubernetes"]
        cache_list = ["none","redis"]
        cdn_list = ["off","on"]
        tls_list = ["off","on"]
        endpoint_list = ["light","medium","heavy"]
        load_list = ["mixed","db_bound","cpu_bound"]
        arch_list = ["three_tier","microservices","serverless"]
        scale_list = ["vertical","horizontal","autoscaling"]
    else:
        os_list = list(b["os"].keys())
        web_list = list(b["web_server"].keys())
        runtime_list = list(b["runtime"].keys())
        db_list = list(b["db"].keys())
        container_list = list(b["container"].keys())
        orch_list = list(b["orchestrator"].keys())
        cache_list = list(b["cache"].keys())
        cdn_list = list(b["cdn"].keys())
        tls_list = list(b["tls"].keys())
        endpoint_list = list(b["endpoint_complexity"].keys())
        load_list = list(b["load_profile"].keys())
        arch_list = list(b["architecture"].keys())
        scale_list = list(b["scaling_strategy"].keys())

    combos = itertools.product(os_list, web_list, runtime_list, db_list,
                              container_list, orch_list, cache_list, cdn_list, tls_list,
                              load_list, arch_list, scale_list, lb_list, endpoint_list,
                              cores_list, app_rep_list,
                              db_rep_mode_list, db_read_rep_list, read_ratio_list,
                              pool_profile_list, pool_override_list, db_hard_list)

    out_path = args.out
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "os","web","runtime","db","container","orchestrator","cache","cdn","tls",
            "load_profile","architecture","scaling_strategy","lb_mesh","endpoint",
            "cores_per_instance","app_replicas",
            "db_cores_primary","db_replication_mode","db_read_replicas","read_ratio_pct",
            "connection_pool_profile","pool_per_instance","db_conn_hard_limit",
            "bw_mbps","payload_kb","safety",
            "lat_ms_endpoint_effective","total_cores_app","rps_core_adj","RPS_cpu","RPS_db_primary","RPS_db_effective","RPS_pool_limit","RPS_db","RPS_red","RPS_cap",
            "usuarios","bottleneck","connMax_db_primary","mult_infra","effectiveMaxConn","maxAppConn"
        ])
        count = 0
        for (osv, web, rt, dbv, cont, orch, cache, cdn, tls,
             loadp, arch, scale, lbm, ep,
             corespi, replicas,
             dbmode, dbread, rr,
             poolprof, poolovr, dbhard) in combos:

            if dbmode == "none":
                dbread = 0

            pargs = argparse.Namespace(
                os=osv, web=web, runtime=rt, db=dbv, container=cont, orchestrator=orch,
                cache=cache, cdn=cdn, tls=tls, load_profile=loadp, architecture=arch, scaling_strategy=scale, lb_mesh=lbm, endpoint=ep,
                cores_per_instance=corespi, app_replicas=replicas,
                db_cores_primary=args.db_cores_primary, db_replication_mode=dbmode, db_read_replicas=dbread, read_ratio_pct=rr,
                connection_pool_profile=poolprof, pool_per_instance=poolovr, db_conn_hard_limit=dbhard,
                bandwidth_mbps=args.bandwidth_mbps, payload_kb=args.payload_kb, safety=args.safety
            )
            res = calculate(pargs, b)
            writer.writerow([
                osv, web, rt, dbv, cont, orch, cache, cdn, tls,
                loadp, arch, scale, lbm, ep,
                corespi, replicas,
                args.db_cores_primary, dbmode, dbread, rr,
                poolprof, poolovr, dbhard,
                args.bandwidth_mbps, args.payload_kb, args.safety,
                f"{res['lat_ms_endpoint_effective']:.0f}", f"{res['total_cores_app']:.0f}", f"{res['rps_core_adj']:.2f}",
                f"{res['RPS_cpu']:.2f}", f"{res['RPS_db_primary']:.2f}", f"{res['RPS_db_effective']:.2f}",
                f"{res['RPS_pool_limit']:.2f}", f"{res['RPS_db']:.2f}",
                f"{res['RPS_red']:.2f}" if res["RPS_red"] != float("inf") else "inf",
                f"{res['RPS_cap']:.2f}", f"{res['usuarios_concurrentes']:.0f}", res["bottleneck"],
                res["connMax_db_primary"], f"{res['multiplicador_infra']:.3f}", res["effectiveMaxConn"], res["maxAppConn"]
            ])
            count += 1

    print(f"Escribí {count} filas en {out_path}")

if __name__ == "__main__":
    main()
