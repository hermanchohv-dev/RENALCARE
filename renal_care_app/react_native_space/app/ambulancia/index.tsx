import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePatientsControllerGetAmbulance } from "@/src/api/generated/api";
import { AppIcon } from "@/src/components/AppIcon";
import { AmbulanceVehicle } from "@/src/components/AmbulanceVehicle";
import { TransportMap } from "@/src/components/TransportMap";
import { LoadingScreen } from "@/src/components/LoadingScreen";
import { transportMap } from "@/src/transport/mapData";

const DURATION = 45000;
type Phase = "idle" | "running" | "paused" | "arrived";

export default function AmbulanciaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data, isLoading, isError, refetch } =
    usePatientsControllerGetAmbulance();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [run, setRun] = useState(0);
  const elapsed = useRef(0),
    startedAt = useRef(0);
  const ready = transportMap.ready && transportMap.route.length > 1;
  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/tabs");

  useEffect(() => {
    if (phase !== "running") return;
    startedAt.current = Date.now() - elapsed.current;
    let frame = 0,
      lastPaint = 0;
    const tick = () => {
      elapsed.current = Math.min(
        DURATION,
        Math.max(0, Date.now() - startedAt.current),
      );
      if (Date.now() - lastPaint >= 60 || elapsed.current === DURATION) {
        setProgress(elapsed.current / DURATION);
        lastPaint = Date.now();
      }
      if (elapsed.current === DURATION) setPhase("arrived");
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, run]);

  const start = () => {
    if (!ready) return;
    if (phase === "running") {
      elapsed.current = Math.min(DURATION, Date.now() - startedAt.current);
      setProgress(elapsed.current / DURATION);
      setPhase("paused");
    } else {
      if (phase === "idle" || phase === "arrived") {
        elapsed.current = 0;
        setProgress(0);
      }
      setRun((n) => n + 1);
      setPhase("running");
    }
  };
  const reset = () => {
    elapsed.current = 0;
    setProgress(0);
    setPhase("idle");
  };
  if (isLoading) return <LoadingScreen />;
  const unavailable = !data?.available;
  const minutes = Math.max(
    1,
    Math.ceil(
      Math.max(5, (transportMap.distanceMeters / 1000 / 25) * 60) *
        (1 - progress),
    ),
  );
  const status =
    phase === "arrived"
      ? "Trayecto completado"
      : phase === "paused"
        ? "Simulación en pausa"
        : phase === "idle"
          ? "Listo para salir"
          : progress > 0.82
            ? "Llegando al hospital"
            : "En camino";
  const step =
    phase === "arrived" ? 3 : phase === "idle" ? 0 : progress > 0.82 ? 2 : 1;
  const button =
    phase === "running"
      ? "Pausar"
      : phase === "paused"
        ? "Continuar"
        : phase === "arrived"
          ? "Repetir simulación"
          : "Simular recorrido";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={styles.back}
          onPress={goBack}
        >
          <AppIcon name="arrow-left" size={22} color="#19334D" />
        </Pressable>
        <View>
          <Text style={styles.eyebrow}>TRANSPORTE · DEMOSTRACIÓN</Text>
          <Text style={styles.title}>Tu trayecto al hospital</Text>
        </View>
      </View>
      {isError ? (
        <View style={styles.card}>
          <Text style={styles.status}>No se pudo cargar el transporte</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.reset}>Reintentar</Text>
          </Pressable>
        </View>
      ) : unavailable ? (
        <View style={styles.empty}>
          <AmbulanceVehicle size={52} />
          <Text style={styles.status}>
            Este servicio solo está disponible para pacientes en Hemodiálisis
          </Text>
          <Pressable style={styles.primary} onPress={goBack}>
            <Text style={styles.primaryText}>Volver</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.mapWrap}>
            <TransportMap
              width={Math.max(240, width - 32)}
              progress={progress}
            />
          </View>
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      phase === "paused"
                        ? "#E4A43D"
                        : phase === "arrived"
                          ? "#24896B"
                          : "#3186E8",
                  },
                ]}
              />
              <Text style={styles.status} testID="transport-status">
                {status}
              </Text>
              <View style={styles.demoBadge}>
                <Text style={styles.demoText}>SIMULADO</Text>
              </View>
            </View>
            <View style={styles.metrics}>
              <View>
                <Text style={styles.metric}>
                  {phase === "arrived" ? "Llegada" : `${minutes} min`}
                </Text>
                <Text style={styles.caption}>Tiempo ilustrativo restante</Text>
              </View>
              <View style={styles.metricDivider} />
              <View>
                <Text style={styles.metric}>
                  {(
                    (transportMap.distanceMeters * (1 - progress)) /
                    1000
                  ).toFixed(1)}{" "}
                  km
                </Text>
                <Text style={styles.caption}>Distancia restante</Text>
              </View>
            </View>
            <View style={styles.stages}>
              {["Salida", "En camino", "Llegando", "Hospital"].map(
                (label, i) => (
                  <View key={label} style={styles.stage}>
                    <View
                      style={[
                        styles.stageLine,
                        { backgroundColor: i <= step ? "#3B86DE" : "#E5EBF2" },
                      ]}
                    />
                    <Text
                      style={[
                        styles.stageText,
                        { color: i === step ? "#246CC0" : "#8190A0" },
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                ),
              )}
            </View>
            <View style={styles.unit}>
              <View style={styles.vehicleBadge}>
                <AmbulanceVehicle size={22} />
              </View>
              <View>
                <Text style={styles.unitName}>Unidad DEMO-01</Text>
                <Text style={styles.caption}>
                  Vehículo ficticio · Sin solicitud de transporte
                </Text>
              </View>
            </View>
            <View style={styles.stops}>
              <View style={styles.stopRow}>
                <View style={styles.startDot} />
                <View>
                  <Text style={styles.stopKind}>SALIDA</Text>
                  <Text style={styles.stopName}>Parque del Espolón</Text>
                </View>
              </View>
              <View style={styles.stopConnector} />
              <View style={styles.stopRow}>
                <AppIcon name="hospital-marker" size={19} color="#2771BD" />
                <View>
                  <Text style={styles.stopKind}>DESTINO</Text>
                  <Text style={styles.stopName}>
                    Hospital Universitario San Pedro
                  </Text>
                </View>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={!ready}
              onPress={start}
              style={[styles.primary, !ready && { opacity: 0.45 }]}
            >
              <AppIcon
                name={phase === "arrived" ? "check-circle" : "play-circle"}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.primaryText}>{button}</Text>
            </Pressable>
            {phase !== "idle" && (
              <Pressable accessibilityRole="button" onPress={reset}>
                <Text style={styles.reset}>Volver al inicio del recorrido</Text>
              </Pressable>
            )}
            <Text style={styles.disclaimer}>
              {ready
                ? "Demostración acelerada de 45 segundos. La ubicación y los tiempos son ficticios. No representa tráfico ni disponibilidad real."
                : "Antes de publicar hay que descargar y verificar la cartografía. No se muestra una ruta inventada como mapa real."}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F2F5F9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 18,
    gap: 12,
  },
  back: {
    backgroundColor: "#FFFFFF",
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 10,
    color: "#7890A4",
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: { fontSize: 21, fontWeight: "800", color: "#1D354C", marginTop: 4 },
  mapWrap: { marginHorizontal: 16 },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#314864",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  status: { fontSize: 17, fontWeight: "700", color: "#233E55", flexShrink: 1 },
  demoBadge: {
    marginLeft: "auto",
    backgroundColor: "#EAF2FD",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  demoText: { fontSize: 9, fontWeight: "800", color: "#4679AA" },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 20,
  },
  metric: { fontSize: 28, fontWeight: "800", color: "#173D60" },
  caption: { fontSize: 10, color: "#7E90A0", marginTop: 4 },
  metricDivider: { height: 38, width: 1, backgroundColor: "#E7EDF4" },
  stages: { flexDirection: "row", gap: 4, marginBottom: 20 },
  stage: { flex: 1 },
  stageLine: { height: 4, borderRadius: 3, marginBottom: 7 },
  stageText: { fontSize: 10, fontWeight: "600" },
  unit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEF2F7",
  },
  vehicleBadge: {
    width: 44,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EDF5FD",
    alignItems: "center",
    justifyContent: "center",
  },
  unitName: { fontSize: 14, color: "#26465F", fontWeight: "700" },
  stops: { paddingVertical: 20 },
  stopRow: { flexDirection: "row", alignItems: "center", gap: 13 },
  startDot: {
    width: 11,
    height: 11,
    marginHorizontal: 4,
    borderWidth: 3,
    borderColor: "#2A8B6C",
    borderRadius: 6,
  },
  stopKind: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A2AD",
    letterSpacing: 1,
  },
  stopName: { fontSize: 13, color: "#2D485D", fontWeight: "600", marginTop: 3 },
  stopConnector: {
    height: 18,
    width: 1,
    backgroundColor: "#CBD8E3",
    marginLeft: 9,
    marginVertical: 3,
  },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2A7FE4",
    paddingVertical: 14,
    borderRadius: 15,
  },
  primaryText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  reset: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A78A4",
    textAlign: "center",
    paddingTop: 14,
  },
  disclaimer: {
    fontSize: 10,
    color: "#8A98A5",
    lineHeight: 15,
    textAlign: "center",
    marginTop: 16,
  },
  empty: { margin: 24, alignItems: "center", gap: 24, paddingTop: 40 },
});
