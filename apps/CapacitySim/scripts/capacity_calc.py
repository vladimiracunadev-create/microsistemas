#!/usr/bin/env python3
import argparse, json, os

BASE = os.path.join(os.path.dirname(__file__), "..", "app", "data", "baselines.json")

def load_baselines(path=BASE):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def bps(mbps): return mbps * 1_000_000
def bits_from_kb(kb): return kb * 1024 * 8

def clamp(x, a, b): return max(a, min(b, x))

def calculate(args, b):
    base_lat = b["endpoint_complexity"][args.endpoint]["lat_ms"]
    lp = b["load_profile"][args.load_profile]
    arch = b["architecture"][args.architecture]
    scale = b["scaling_strategy"][args.scaling_strategy]
    lb = b["lb_mesh"][args.lb_mesh]

    lat_ms_endpoint = (base_lat * lp["lat_factor"]) + arch["lat_add_ms"] + arch.get("avg_cold_start_ms", 0) + scale.get("lat_add_ms", 0) + lb.get("lat_add_ms", 0)

    rps_core_base = b["runtime"][args.runtime]["rps_per_core_base"]

    infra_mult = (b["os"][args.os]["mult"] *
                  b["web_server"][args.web]["mult"] *
                  b["container"][args.container]["mult"] *
                  b["orchestrator"][args.orchestrator]["mult"] *
                  b["cache"][args.cache]["mult"] *
                  b["cdn"][args.cdn]["mult"] *
                  b["tls"][args.tls]["mult"] *
                  arch["mult"] *
                  scale.get("app_mult", 1.0) *
                  lb.get("app_mult", 1.0))

    total_cores_app = args.cores_per_instance * max(1, args.app_replicas)

    rps_core_adj = rps_core_base * infra_mult * lp["cpu_mult"] * (100.0 / lat_ms_endpoint)
    RPS_cpu = total_cores_app * rps_core_adj

    dbConf = b["db"][args.db]
    connMaxPrimary = dbConf["conn_per_core"] * args.db_cores_primary
    RPS_db_primary = (connMaxPrimary / (dbConf["lat_ms"] / 1000.0)) * lp["db_mult"]

    read_ratio = clamp(args.read_ratio_pct, 0, 100) / 100.0
    write_ratio = 1.0 - read_ratio

    # read replicas effect
    RPS_db_effective = RPS_db_primary
    if args.db_replication_mode == "read_replicas" and args.db_read_replicas > 0:
        readCap = RPS_db_primary * (1 + args.db_read_replicas)
        writeCap = RPS_db_primary
        limRead = (readCap / read_ratio) if read_ratio > 0 else float("inf")
        limWrite = (writeCap / write_ratio) if write_ratio > 0 else float("inf")
        RPS_db_effective = min(limRead, limWrite)

    # Connection pool / hard limit
    poolPerInst = max(1, args.pool_per_instance)
    maxAppConn = poolPerInst * max(1, args.app_replicas)
    effectiveMaxConn = min(args.db_conn_hard_limit, maxAppConn)
    RPS_pool_limit = (effectiveMaxConn / (dbConf["lat_ms"] / 1000.0))

    RPS_db = min(RPS_db_effective, RPS_pool_limit)

    payload_bits = bits_from_kb(args.payload_kb)
    RPS_red = ((bps(args.bandwidth_mbps) / payload_bits) * lp["net_mult"]) if payload_bits > 0 else float("inf")

    RPS_cap_raw = min(RPS_cpu, RPS_db, RPS_red)
    RPS_cap = RPS_cap_raw * args.safety
    users = RPS_cap * (lat_ms_endpoint / 1000.0)

    bottleneck = "CPU/App" if RPS_cap_raw == RPS_cpu else ("Base de Datos/Conexiones" if RPS_cap_raw == RPS_db else "Red")

    return {
        "lat_ms_endpoint_effective": lat_ms_endpoint,
        "total_cores_app": total_cores_app,
        "rps_core_adj": rps_core_adj,
        "RPS_cpu": RPS_cpu,
        "RPS_db_primary": RPS_db_primary,
        "RPS_db_effective": RPS_db_effective,
        "RPS_pool_limit": RPS_pool_limit,
        "RPS_db": RPS_db,
        "maxAppConn": maxAppConn,
        "effectiveMaxConn": effectiveMaxConn,
        "RPS_red": RPS_red,
        "RPS_cap": RPS_cap,
        "usuarios_concurrentes": users,
        "bottleneck": bottleneck,
        "multiplicador_infra": infra_mult,
        "connMax_db_primary": connMaxPrimary,
        "load_profile": args.load_profile,
        "architecture": args.architecture,
        "scaling_strategy": args.scaling_strategy,
        "lb_mesh": args.lb_mesh,
        "db_replication_mode": args.db_replication_mode,
        "connection_pool": {"pool_per_instance": poolPerInst, "db_conn_hard_limit": args.db_conn_hard_limit}
    }

def main():
    p = argparse.ArgumentParser(description="Estimador de capacidad (simulador heurístico)")
    p.add_argument("--os", choices=["linux","windows"], required=True)
    p.add_argument("--web", choices=["nginx","apache","iis","caddy"], required=True)
    p.add_argument("--runtime", choices=["node","php-fpm","python-gunicorn","java-tomcat",".net"], required=True)
    p.add_argument("--db", choices=["postgres","mysql","sqlserver","mongodb","cassandra"], required=True)
    p.add_argument("--container", choices=["none","docker"], required=True)
    p.add_argument("--orchestrator", choices=["none","kubernetes"], required=True)
    p.add_argument("--cache", choices=["none","redis","memcached"], required=True)
    p.add_argument("--cdn", choices=["off","on"], required=True)
    p.add_argument("--tls", choices=["off","on"], required=True)

    p.add_argument("--load_profile", choices=["mixed","cpu_bound","io_bound","db_bound","net_bound"], required=True)
    p.add_argument("--architecture", choices=["monolith","three_tier","microservices","serverless"], required=True)
    p.add_argument("--scaling_strategy", choices=["vertical","horizontal","autoscaling"], required=True)
    p.add_argument("--lb_mesh", choices=["none","alb_nlb","service_mesh"], required=True)
    p.add_argument("--endpoint", choices=["light","medium","heavy"], required=True)

    p.add_argument("--cores_per_instance", type=int, required=True, help="Núcleos de APP por instancia")
    p.add_argument("--app_replicas", type=int, default=1)

    p.add_argument("--db_cores_primary", type=int, required=True)
    p.add_argument("--db_replication_mode", choices=["none","read_replicas"], required=True)
    p.add_argument("--db_read_replicas", type=int, default=0)
    p.add_argument("--read_ratio_pct", type=float, default=80.0)

    p.add_argument("--connection_pool_profile", choices=["default","small","large"], default="default")
    p.add_argument("--pool_per_instance", type=int, default=50)
    p.add_argument("--db_conn_hard_limit", type=int, default=800)

    p.add_argument("--bandwidth_mbps", type=float, required=True)
    p.add_argument("--payload_kb", type=float, required=True)
    p.add_argument("--safety", type=float, default=0.7)

    args = p.parse_args()
    b = load_baselines()

    # apply profile defaults if user left pool_per_instance as default value
    prof = b["connection_pool"][args.connection_pool_profile]
    # If user did not explicitly pass --pool_per_instance, argparse can't detect; so we keep user value.
    # Still, we help: if pool_per_instance == 50 and profile isn't default, override.
    if args.connection_pool_profile != "default" and args.pool_per_instance == 50:
        args.pool_per_instance = prof.get("pool_per_instance", 50)

    res = calculate(args, b)
    print(json.dumps(res, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
