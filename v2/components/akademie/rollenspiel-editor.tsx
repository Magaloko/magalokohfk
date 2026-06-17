"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cockpitMutate, errText } from "@/components/cockpit/mutate";
import { Modal } from "@/components/cockpit/task-editor";
import type { Rollenspiel } from "@/lib/akademie";
import { Icon } from "@/components/icon";
import { IconButton } from "@/components/_primitives/icon-button";

const COL = "akademieRoleplays";
const sel = "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const L = (s: string) => <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted-2">{s}</span>;

type Ablauf = { schritt?: number; name: string; beschreibung: string };
type Einwand = { einwand: string; psychologie: string; erwartete_technik: string };
type Krit = { kriterium: string; punkte_max: string; beschreibung: string };
type RoleplayPreset = {
  label: string;
  b: { titel: string; persona: string; setting: string; verkaufstechnik: string; produkt: string; marke: string; ziel_aov: string };
  ablauf: Ablauf[];
  einwaende: Einwand[];
  erfolgskriterien: string[];
};

const SERVICE_KRIT: Krit[] = [
  { kriterium: "Empathie", punkte_max: "3", beschreibung: "Ärger ernst nehmen, ruhig bleiben, wertschätzend reagieren." },
  { kriterium: "Problem korrekt erkannt", punkte_max: "3", beschreibung: "Kernproblem benennen und nicht am Kunden vorbeireden." },
  { kriterium: "Richtige Rückfragen", punkte_max: "3", beschreibung: "Bestellnummer, Zeitraum, Zustand oder relevante Details gezielt abfragen." },
  { kriterium: "Keine falsche Zusage", punkte_max: "3", beschreibung: "Keine Erstattung, Ersatzlieferung oder Frist versprechen, bevor es geprüft ist." },
  { kriterium: "DSGVO/Datenschutz", punkte_max: "2", beschreibung: "Nur notwendige Daten abfragen und keine sensiblen Daten offenlegen." },
  { kriterium: "Eskalation erkannt", punkte_max: "2", beschreibung: "Kritische Fälle an die richtige Person oder manuelle Prüfung geben." },
  { kriterium: "Klare nächste Aktion", punkte_max: "3", beschreibung: "Konkreten nächsten Schritt mit Rückmeldeweg oder Zeitfenster nennen." },
  { kriterium: "HFK-Tonalität", punkte_max: "2", beschreibung: "Freundlich, verbindlich, hochwertig und nicht abwehrend formulieren." },
];

const SERVICE_ABLAUF: Ablauf[] = [
  { schritt: 1, name: "Beruhigen", beschreibung: "Emotion aufnehmen, Verständnis zeigen, Gespräch öffnen." },
  { schritt: 2, name: "Klären", beschreibung: "Relevante Daten und Ursache strukturiert abfragen." },
  { schritt: 3, name: "Grenzen halten", beschreibung: "Keine ungeprüften Zusagen machen, Regelwerk und Prüfung sauber trennen." },
  { schritt: 4, name: "Nächster Schritt", beschreibung: "Konkrete Folgeaktion, Eskalation oder Rückmeldung verbindlich formulieren." },
];

const PRESETS: RoleplayPreset[] = [
  {
    label: "Lieferverzug",
    b: {
      titel: "Servicefall: Lieferverzug verärgerter Kunde",
      persona: "Verärgerter Elternteil, wartet dringend auf die Bestellung",
      setting: "Der Kunde meldet sich, weil eine Bestellung seit mehreren Tagen überfällig ist. Er ist enttäuscht und erwartet sofort eine klare Antwort.",
      verkaufstechnik: "Deeskalation",
      produkt: "Online-Bestellung mit Kinder-/Babyartikel",
      marke: "HFK-Kundenservice",
      ziel_aov: "",
    },
    ablauf: SERVICE_ABLAUF,
    einwaende: [
      { einwand: "Ich warte seit Tagen und niemand sagt mir, was los ist.", psychologie: "Ärger über fehlende Transparenz", erwartete_technik: "Erst entschuldigen, dann Bestellnummer und Statusprüfung ankündigen." },
      { einwand: "Ich brauche das dringend, sonst hätte ich woanders bestellt.", psychologie: "Zeitdruck und Vertrauensverlust", erwartete_technik: "Dringlichkeit anerkennen, realistische Rückmeldung zusagen, keine ungeprüfte Liefergarantie." },
    ],
    erfolgskriterien: ["Kunde fühlt sich ernst genommen", "Bestellnummer/Status wird geklärt", "Keine ungeprüfte Lieferzusage", "Konkrete Rückmeldung wird genannt"],
  },
  {
    label: "Retoure außerhalb Frist",
    b: {
      titel: "Servicefall: Retoure außerhalb Frist",
      persona: "Kunde bittet um Kulanz, ist unsicher und leicht defensiv",
      setting: "Der Kunde möchte einen Artikel zurückgeben, obwohl die reguläre Rückgabefrist überschritten ist.",
      verkaufstechnik: "Retoure",
      produkt: "Retourenfall",
      marke: "HFK-Kundenservice",
      ziel_aov: "",
    },
    ablauf: SERVICE_ABLAUF,
    einwaende: [
      { einwand: "Ich habe es einfach nicht früher geschafft, können Sie nicht eine Ausnahme machen?", psychologie: "Hoffnung auf Kulanz", erwartete_technik: "Verständnis zeigen, Frist/Artikelzustand abfragen, manuelle Prüfung statt Sofortzusage." },
      { einwand: "Bei anderen Shops geht das aber problemlos.", psychologie: "Vergleichsdruck", erwartete_technik: "Ruhig bleiben, HFK-Regel erklären, mögliche Prüfung anbieten." },
    ],
    erfolgskriterien: ["Kulanz nicht vorschnell zusagen", "Artikelzustand und Kaufdatum abfragen", "Regel freundlich erklären", "Manuelle Prüfung korrekt anbieten"],
  },
  {
    label: "Beschädigter Artikel",
    b: {
      titel: "Servicefall: beschädigter oder falscher Artikel",
      persona: "Enttäuschter Kunde, will schnelle Lösung",
      setting: "Der Kunde sagt, der gelieferte Artikel sei beschädigt oder falsch. Er erwartet Ersatz oder Erstattung.",
      verkaufstechnik: "Reklamation",
      produkt: "Reklamierter Artikel",
      marke: "HFK-Kundenservice",
      ziel_aov: "",
    },
    ablauf: SERVICE_ABLAUF,
    einwaende: [
      { einwand: "Das Paket kam beschädigt an, ich will sofort Ersatz.", psychologie: "Frust und Erwartung auf schnelle Wiedergutmachung", erwartete_technik: "Entschuldigen, Foto/Bestellnummer erfragen, Prüfung und nächste Schritte erklären." },
      { einwand: "Ich habe keine Zeit für lange Mails hin und her.", psychologie: "Ungeduld", erwartete_technik: "Prozess kurz halten, genau sagen welche Information benötigt wird." },
    ],
    erfolgskriterien: ["Beleg/Fotos korrekt anfordern", "Keine Soforterstattung ohne Prüfung", "Lösungsweg klar erklären", "Ton bleibt ruhig und hilfreich"],
  },
  {
    label: "Rechnung/Zahlung",
    b: {
      titel: "Servicefall: Rechnung oder Zahlung unklar",
      persona: "Kunde ist verunsichert wegen Rechnung, Zahlung oder Mahnung",
      setting: "Der Kunde versteht eine Rechnung, Zahlung oder Zahlungsaufforderung nicht und fragt nach Klärung.",
      verkaufstechnik: "Rechnungsklärung",
      produkt: "Rechnung/Zahlung",
      marke: "HFK-Kundenservice",
      ziel_aov: "",
    },
    ablauf: SERVICE_ABLAUF,
    einwaende: [
      { einwand: "Ich habe doch schon bezahlt, warum bekomme ich diese Nachricht?", psychologie: "Verunsicherung und Abwehr", erwartete_technik: "Ruhig bleiben, Zahlungsdaten nicht offen wiederholen, Vorgang prüfen lassen." },
      { einwand: "Dann schicken Sie mir eben alle Daten nochmal.", psychologie: "Will schnelle Lösung", erwartete_technik: "Datenschutz beachten und sichere Identifikation verlangen." },
    ],
    erfolgskriterien: ["Datenschutz wird eingehalten", "Zahlungsstatus wird nur geprüft, nicht geraten", "Kunde bekommt klare nächste Aktion", "Keine sensiblen Daten im Chat offenlegen"],
  },
  {
    label: "VIP-Eskalation",
    b: {
      titel: "Servicefall: VIP-Kunde mit Eskalation",
      persona: "Langjähriger guter Kunde, enttäuscht und kurz davor abzuspringen",
      setting: "Ein wichtiger Kunde ist mit einem Servicefall unzufrieden und verlangt eine schnelle, persönliche Lösung.",
      verkaufstechnik: "Eskalation",
      produkt: "VIP-Servicefall",
      marke: "HFK-Kundenservice",
      ziel_aov: "",
    },
    ablauf: SERVICE_ABLAUF,
    einwaende: [
      { einwand: "Ich kaufe seit Jahren bei Ihnen, so behandelt man Stammkunden nicht.", psychologie: "Enttäuschung und Statusverlust", erwartete_technik: "Wertschätzung ausdrücken, Verantwortung übernehmen, Eskalation anbieten." },
      { einwand: "Ich möchte, dass sich jemand Verantwortlicher darum kümmert.", psychologie: "Will ernst genommen werden", erwartete_technik: "Saubere Weitergabe zusagen, ohne Lösung vorwegzunehmen." },
    ],
    erfolgskriterien: ["VIP-Kontext wird wertgeschätzt", "Eskalation wird erkannt", "Keine leere Beschwichtigung", "Nächste Rückmeldung ist klar"],
  },
  {
    label: "Beratung nach Problem",
    b: {
      titel: "Servicefall: Beratung nach Kundenproblem",
      persona: "Kunde ist skeptisch, braucht aber weiterhin eine passende Empfehlung",
      setting: "Nach einem Problem mit einer Bestellung möchte der Kunde wissen, ob HFK eine bessere Alternative empfehlen kann.",
      verkaufstechnik: "Beratung nach Serviceproblem",
      produkt: "Alternative Produktempfehlung",
      marke: "HFK-Kundenservice",
      ziel_aov: "",
    },
    ablauf: SERVICE_ABLAUF,
    einwaende: [
      { einwand: "Warum sollte ich jetzt nochmal bei Ihnen bestellen?", psychologie: "Vertrauensverlust", erwartete_technik: "Problem anerkennen, Bedarf neu klären, keine defensive Rechtfertigung." },
      { einwand: "Ich will diesmal sicher sein, dass es passt.", psychologie: "Sicherheitsbedürfnis", erwartete_technik: "Konkrete Bedarfsfragen stellen und Empfehlung nachvollziehbar machen." },
    ],
    erfolgskriterien: ["Vertrauen wird aktiv repariert", "Bedarf wird neu geklärt", "Empfehlung bleibt realistisch", "Kunde bekommt einen sicheren nächsten Schritt"],
  },
];

export function NewRollenspielButton() {
  const [open, setOpen] = useState(false);
  return (<>
    <button onClick={() => setOpen(true)} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:opacity-90 min-h-11">+ Neues Rollenspiel</button>
    {open && <RpForm onClose={() => setOpen(false)} />}
  </>);
}

export function RollenspielActions({ id, rp }: { id: string; rp: Rollenspiel }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  async function del() {
    if (busy || !confirm("Dieses Rollenspiel wirklich löschen?")) return;
    setBusy(true);
    const r = await cockpitMutate({ collection: COL, action: "delete", id });
    setBusy(false);
    if (r.ok) router.refresh(); else alert(errText(r.error));
  }
  return (
    <div className="mt-3 flex gap-2 border-t border-line/60 pt-3">
      <button disabled={busy} onClick={() => setEdit(true)} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-1.5 min-h-10 text-xs font-semibold hover:text-ink disabled:opacity-50"><Icon name="edit" className="h-4 w-4" />Bearbeiten</button>
      <button disabled={busy} onClick={del} className="inline-flex items-center gap-1 rounded-lg bg-red/10 px-3 py-1.5 min-h-10 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-50"><Icon name="trash" className="h-4 w-4" />Löschen</button>
      {edit && <RpForm id={id} rp={rp} onClose={() => setEdit(false)} />}
    </div>
  );
}

function RowList<T>({ items, setItems, blank, render }: { items: T[]; setItems: (x: T[]) => void; blank: () => T; render: (it: T, set: (p: Partial<T>) => void) => ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-line bg-surface-2/40 p-2">
          <div className="flex-1">{render(it, (p) => setItems(items.map((x, j) => (j === i ? { ...x, ...p } : x))))}</div>
          <IconButton icon="x" label="entfernen" onClick={() => setItems(items.filter((_, j) => j !== i))} className="-mr-2" />
        </div>
      ))}
      <button onClick={() => setItems([...items, blank()])} className="self-start rounded bg-surface-2 px-2 py-1 text-xs font-semibold text-muted hover:text-ink">+ hinzufügen</button>
    </div>
  );
}

function RpForm({ id, rp, onClose }: { id?: string; rp?: Rollenspiel; onClose: () => void }) {
  const router = useRouter();
  const [b, setB] = useState({
    titel: rp?.titel || "", persona: rp?.persona || "", setting: rp?.setting || "", verkaufstechnik: rp?.verkaufstechnik || "",
    produkt: rp?.produkt || "", marke: rp?.marke || "", ziel_aov: rp?.ziel_aov != null ? String(rp.ziel_aov) : "",
  });
  const [ablauf, setAblauf] = useState<Ablauf[]>((rp?.ablauf || []).map((a) => ({ schritt: a.schritt, name: a.name || "", beschreibung: a.beschreibung || "" })));
  const [einw, setEinw] = useState<Einwand[]>((rp?.einwaende || []).map((e) => ({ einwand: e.einwand || "", psychologie: e.psychologie || "", erwartete_technik: e.erwartete_technik || "" })));
  const [krit, setKrit] = useState<Krit[]>((rp?.bewertungskriterien || []).map((k) => ({ kriterium: k.kriterium || "", punkte_max: k.punkte_max != null ? String(k.punkte_max) : "", beschreibung: k.beschreibung || "" })));
  const [erfolg, setErfolg] = useState<string[]>((rp?.erfolgskriterien || []).map(String));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof b) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setB({ ...b, [k]: e.target.value });

  function applyPreset(p: RoleplayPreset) {
    setB(p.b);
    setAblauf(p.ablauf.map((x) => ({ ...x })));
    setEinw(p.einwaende.map((x) => ({ ...x })));
    setKrit(SERVICE_KRIT.map((x) => ({ ...x })));
    setErfolg([...p.erfolgskriterien]);
    setErr("");
  }

  async function save() {
    if (!b.titel.trim()) { setErr("Titel fehlt."); return; }
    setBusy(true); setErr("");
    const item = {
      ...b,
      ziel_aov: b.ziel_aov,
      ablauf: ablauf.map((a, i) => ({ schritt: a.schritt ?? i + 1, name: a.name, beschreibung: a.beschreibung })),
      einwaende: einw,
      bewertungskriterien: krit.map((k) => ({ kriterium: k.kriterium, punkte_max: k.punkte_max, beschreibung: k.beschreibung })),
      erfolgskriterien: erfolg.filter((x) => x.trim()),
    };
    const r = id ? await cockpitMutate({ collection: COL, action: "replace", id, item }) : await cockpitMutate({ collection: COL, action: "create", item });
    setBusy(false);
    if (r.ok) { onClose(); router.refresh(); } else setErr(errText(r.error));
  }

  return (
    <Modal onClose={onClose} title={id ? "Rollenspiel bearbeiten" : "Neues Rollenspiel"}>
      <div className="flex max-h-[72vh] flex-col gap-3 overflow-y-auto pr-1">
        {!id && (
          <div className="rounded-lg border border-line bg-surface-2/50 p-3">
            {L("Servicefall-Vorlagen")}
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => applyPreset(p)}
                  className="rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-muted transition hover:text-ink">
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <label className="block">{L("Titel *")}<input value={b.titel} onChange={set("titel")} className={sel} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">{L("Fokus / Technik")}<input value={b.verkaufstechnik} onChange={set("verkaufstechnik")} placeholder="z. B. Deeskalation, Retoure, Reklamation" className={sel} /></label>
          <label className="block">{L("Ziel-AOV (€)")}<input value={b.ziel_aov} onChange={set("ziel_aov")} inputMode="numeric" className={sel} /></label>
          <label className="block">{L("Artikel / Vorgang")}<input value={b.produkt} onChange={set("produkt")} className={sel} /></label>
          <label className="block">{L("Marke")}<input value={b.marke} onChange={set("marke")} className={sel} /></label>
        </div>
        <label className="block">{L("Persona")}<input value={b.persona} onChange={set("persona")} className={sel} /></label>
        <label className="block">{L("Situation / Rahmen")}<textarea value={b.setting} onChange={set("setting")} rows={2} className={sel} /></label>

        <div>{L("Ablauf (Schritte)")}
          <RowList items={ablauf} setItems={setAblauf} blank={() => ({ name: "", beschreibung: "" })}
            render={(a, s) => (<div className="flex flex-col gap-1">
              <input value={a.name} onChange={(e) => s({ name: e.target.value })} placeholder="Name" className={sel} />
              <input value={a.beschreibung} onChange={(e) => s({ beschreibung: e.target.value })} placeholder="Beschreibung" className={sel} />
            </div>)} />
        </div>

        <div>{L("Kundenaussagen / Einwände")}
          <RowList items={einw} setItems={setEinw} blank={() => ({ einwand: "", psychologie: "", erwartete_technik: "" })}
            render={(e, s) => (<div className="flex flex-col gap-1">
              <input value={e.einwand} onChange={(ev) => s({ einwand: ev.target.value })} placeholder="Was sagt der Kunde?" className={sel} />
              <input value={e.psychologie} onChange={(ev) => s({ psychologie: ev.target.value })} placeholder="Motiv / Gefühl" className={sel} />
              <input value={e.erwartete_technik} onChange={(ev) => s({ erwartete_technik: ev.target.value })} placeholder="Worauf soll VEKTRA achten?" className={sel} />
            </div>)} />
        </div>

        <div>{L("Bewertungskriterien")}
          <RowList items={krit} setItems={setKrit} blank={() => ({ kriterium: "", punkte_max: "", beschreibung: "" })}
            render={(k, s) => (<div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <input value={k.kriterium} onChange={(e) => s({ kriterium: e.target.value })} placeholder="Kriterium" className={`${sel} flex-1`} />
                <input value={k.punkte_max} onChange={(e) => s({ punkte_max: e.target.value })} placeholder="max." inputMode="numeric" className={`${sel} w-20`} />
              </div>
              <input value={k.beschreibung} onChange={(e) => s({ beschreibung: e.target.value })} placeholder="Beschreibung" className={sel} />
            </div>)} />
        </div>

        <div>{L("Erfolgskriterien")}
          <RowList items={erfolg.map((v) => ({ v }))} setItems={(x) => setErfolg(x.map((o) => o.v))} blank={() => ({ v: "" })}
            render={(o, s) => <input value={o.v} onChange={(e) => s({ v: e.target.value })} placeholder="Erfolgskriterium" className={sel} />} />
        </div>

        {err && <p className="text-sm text-red">{err}</p>}
        <div className="flex justify-end gap-2 border-t border-line/60 pt-3">
          <button onClick={onClose} className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold">Abbrechen</button>
          <button disabled={busy} onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">{busy ? "…" : "Speichern"}</button>
        </div>
      </div>
    </Modal>
  );
}
