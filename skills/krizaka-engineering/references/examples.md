# Examples — real shapes, rewritten

Three shapes found in our own code, made generic. Each « before » passed type checking and review; each « after » is
shorter, does one job per function and lets a library do the generic part.

## 1. An upload route that re-checks what the storage library checks

Before — the route measures the body three times and sniffs the bytes twice:

```ts
export function POST(req: Request) {
  return handle(async () => {
    const { shop } = await requireShop(req);
    const media = await mediaStorage({ maxBytes: MAX_UPLOAD_BYTES });
    if (!media) throw refuse(503, "UPLOAD_UNAVAILABLE", "media storage is not configured");
    if (Number(req.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES + 4096)
      throw refuse(413, "UPLOAD_TOO_LARGE", "file too large");
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) throw refuse(400, "BAD_REQUEST", "no file");
    if (file.size > MAX_UPLOAD_BYTES) throw refuse(413, "UPLOAD_TOO_LARGE", "file too large");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!detectImage(bytes)) throw refuse(400, "UPLOAD_NOT_IMAGE", "not an image");
    const url = await storeImage(media, shop.id, bytes); // sniffs the bytes again, and the storage checks the size again
    return Response.json({ url });
  });
}
```

After — the storage library owns the size and the type; the route authenticates, reads, stores:

```ts
export function POST(req: Request) {
  return handle(async () => {
    const { shop } = await requireShop(req);
    const media = await requireMediaStorage(); // typed « unavailable » error, mapped to 503 once, in handle()
    const upload = await readUpload(req, { field: "file", maxBytes: media.maxBytes });
    const url = await storeImage(media, shop.id, upload.bytes); // storage.upload refuses a wrong size or type
    return Response.json({ url });
  });
}
```

What changed: one limit (a setting, not `MAX + 4096`), one place that checks it, one sniff, the refusals typed by the
library (`StorageError`) and mapped to HTTP once. The parse belongs in the storage package (`readUpload`); while a
function like it is missing from the package, it is added there first, not written per route.

## 2. A form handler with five jobs

Before — find, diff, format a date by hand, compose a sentence, confirm, post, refresh, all in one 47-line function:

```ts
const onSchedule = async (key: string, change: PriceFigures, from: string) => {
  const saved = entries.find((e) => e.key === key);
  if (!saved) return { ok: false, message: say("errors.UNKNOWN_PRICE") };
  const patch = patchOf(before(saved), { amount: String(change.amountCents / 100), from /* … */ });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(`${from}T12:00:00`));
  const summary = [say(/* … */), processorLine].join(" ").trim();
  if (!(await confirm(key, summary))) return { ok: false, message: say("confirm.cancelled") };
  try {
    await krizakaFetch("/api/admin/prices", { method: "POST", json: { key, ...patch } });
  } catch (error) {
    return { ok: false, message: say(`errors.${errorKey(error)}`) };
  }
  await client.invalidateQueries({ queryKey: ["admin-prices"] });
  return { ok: true };
};
```

After — each job is a named function or a library call; the handler reads as its table of contents:

```ts
const schedule = useMutation({
  mutationFn: (plan: PricePlan) => krizakaFetch("/api/admin/prices", { method: "POST", json: plan.patch }),
  onSuccess: () => client.invalidateQueries({ queryKey: priceKeys.all }),
});

const onSchedule = async (key: string, change: PriceFigures, from: string) => {
  const plan = planPriceChange(entries, key, change, from); // pure, unit-tested; a typed refusal when it cannot
  if (!plan.ok) return plan;
  if (!(await confirm(key, priceSummary(plan, { say, locale })))) return cancelled(say);
  await schedule.mutateAsync(plan);
  return { ok: true };
};
```

What changed: money is integer minor units formatted by `formatMoney` (`@krizaka/intl`), never `/ 100`; the date by
`formatDate`, never `new Intl.DateTimeFormat` in a component; the mutation's pending and error states come from
`useMutation`; the query key from a typed key factory; one write per submit.

## 3. A hand-made fetch state

Before — `fetch`, three `useState`s, a hard-coded English fallback:

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState(false);
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    const res = await fetch("/api/v1/auth/forgot", { method: "POST", body: JSON.stringify({ email }) });
    if (res.ok) setSuccess(true);
    else setError((await res.text()) || "Failed to send reset email.");
  } finally {
    setIsSubmitting(false);
  }
};
```

After — the library holds the state and reads the Problem Details; the message comes from the catalogue:

```tsx
const forgot = useMutation({
  mutationFn: (email: string) => krizakaFetch("/api/v1/auth/forgot", { method: "POST", json: { email } }),
});
const onSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  forgot.mutate(email);
};
// forgot.isPending, forgot.isSuccess, and t.errors[errorKey(forgot.error)] for the message
```
