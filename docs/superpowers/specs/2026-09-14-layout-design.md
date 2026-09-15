# Le Truc Atelier — Three-Pane Layout Design

Date: 2026-09-14
Status: implemented (layout skeleton)

## Goal

The Atelier is a direct manipulation editor for Le Truc components, built with
Le Truc components. This step establishes the three-pane layout shell:

- **Left sidebar** — the component tree; clicking a component name opens that
  component in the editor area.
- **Main area** — the component editor (`module-component-editor`, the heart
  of the application, implemented in later steps).
- **Right sidebar** — the properties panel (`module-properties-editor`,
  implemented in later steps) listing reactive properties and addressed
  descendants of the component or selected sub-element.

## Structure

`module-listnav` wraps the whole workspace and coordinates navigation; a
nested pair of `module-splitview`s owns the actual layout:

```
<module-listnav>                  ← listbox ↔ URL hash ↔ lazyload (adopted, unchanged)
  <module-splitview id="workspace" split="0.2">      ← sidebar | rest
    <module-scrollarea>
      <nav> <form-listbox> component tree </form-listbox> </nav>
    </module-scrollarea>
    <button class="divider" role="separator">
    <module-splitview id="editors" split="0.7">        ← editor | properties
      <module-scrollarea>
        <module-component-editor>
          <module-lazyload> … </module-lazyload>     ← shows the selected component
        </module-component-editor>
      </module-scrollarea>
      <button class="divider" role="separator">
      <module-scrollarea>
        <module-properties-editor> … </module-properties-editor>
      </module-scrollarea>
    </module-splitview>
  </module-splitview>
</module-listnav>
```

Key decisions:

- **`module-listnav` is used unchanged** (adopted verbatim): the editor
  pane's `module-lazyload` is its DOM descendant, so its `pass()` wiring and
  URL-hash sync work as upstream. `display: contents` in `main.css` keeps the
  listnav layout-neutral so the workspace splitview fills the viewport.
- **The URL hash is the selection contract.** The sidebar syncs
  selection ↔ hash (deep-linkable, e.g. `/#demo-greeter`); the lazyload shows
  the selected component's partial. When the real editor lands, it replaces
  the lazyload and observes the same contract.
- **Partials** live in `src/partials/<component>.html` and are served by the
  dev server (`server/dev.ts` routes). The `demo-greeter` partial is a live
  instance — the reactivity loop works inside the editor pane today.

## Adopted components

Components forked from the le-truc repo `examples/` directory (MIT, same
author) are **adopted, not vendored**: they live under
`src/components/{category}/{component}/`, mirroring upstream layout
(`module/splitview/`, `form/listbox/`, `_common/`, …) so improvements can be
pulled from upstream per component, and our fork fixes travel the other way.
Only deviation from upstream layout: they root at `src/components/` together
with the Atelier's own components instead of a separate vendor tree.

| Adopted | Role in the Atelier |
| --- | --- |
| `module/splitview` | both split containers (drag + keyboard resize) |
| `module/scrollarea` | pane wrappers (overflow affordances) |
| `module/listnav` | tree ↔ hash ↔ editor coordination |
| `form/listbox` | the component tree itself |
| `module/lazyload` | loads the selected component's partial |
| `card/callout` (CSS only) | loading/error states |
| `_common/{fetchWithCache,highlightMatch,html}` | helpers for listbox/lazyload |

Code deviations from upstream: `form-listbox`'s error branch guards the
optional `card-callout` (upstream would dereference undefined; tsc strict
catches it), and `_common/html.ts` uses `unknown[]` instead of `any[]`
(Biome).

The adopted CSS assumes le-truc's global styles: `main.css` mirrors the used
subset of the design tokens from `examples/_global.css` **and** the
`[hidden] { display: none !important }` reset — without the reset, the
components' `display: block` rules defeat the `hidden` attribute.

The Atelier's own components follow the same layout:
`demo/greeter/` (`demo-greeter`), `module/component-editor/`,
`module/properties-editor/`.

## Atelier components (`src/components/`)

- `module-component-editor` — placeholder; the lazyload inside it displays
  the selected component. Editing comes later.
- `module-properties-editor` — placeholder; static markup currently mirrors
  demo-greeter's property model: reactive property `subject: string`,
  addressed descendants `output` (selector `output`, required: needed to
  display the greeting) and `input` (selector `input`, required: needed to
  enter whom to greet).
- `demo-greeter` — reactive property renamed `name` → `subject` (avoid the
  native form-element `name` semantics).

## Testing

jsdom unit tests via `bun test` (preload `src/test/setup.ts`):

- `module/splitview/module-splitview.test.ts` — split attribute → CSS
  variable + ARIA value, arrow-key resizing.
- `module/listnav/module-listnav.test.ts` — selection → hash, hash →
  selection (back/forward), `src` pass-through to the lazyload.
- `workspace.test.ts` — mounts the full index.html body; all components
  upgrade, initial selection opens the component, split attributes apply.

Environment polyfills in `src/test/setup.ts` (jsdom gaps, documented there):
`IntersectionObserver` stub (scrollarea) and `ElementInternals` parity
(`validationMessage`/`validity`/`setValidity`/`setFormValue`) — without the
latter, `formAssociated()` aborts on connect and silently kills all effects.
Tests reset the URL hash between mounts: writing a child's reactive prop
during a parent's connect (listnav's initial hash → value sync) lands as a
plain own property on a not-yet-initialized listbox and breaks its effects —
a mount-order sharp edge that does not occur in the browser, where component
definitions register before the markup mounts.

## Later steps

1. `module-component-editor`: real editing surface (replaces the lazyload;
   observes the same hash contract).
2. `module-properties-editor`: introspect the selected component's
   definitions (reactive properties, addressed descendants) instead of
   static markup; react to sub-element selection.
3. Component tree from a registry: the listbox can load options from JSON
   (`src` support is already adopted) once the Atelier discovers installed
   components.
4. Consider deferring `module-listnav`'s initial hash → value sync into its
   reactive setup (effect-flushed instead of synchronous in the factory), so
   dynamically composed subtrees can't hit the parent-first mount edge.
