# Photographs

Drop image files in here and they appear on the site automatically. Nothing
needs to be edited in the code — the build reads these folders and matches each
file to a page **by its filename**.

```
public/photo/
├── devices/      photographs of the boxes
├── cables/       photographs of the cable types
└── connectors/   photographs of the plugs and sockets
```

## The one rule

**The filename must be the page's slug**, lowercase, with a normal image
extension. `access-point.jpg` lands on `/devices/access-point`. Nothing else is
needed.

Accepted: `.webp` `.avif` `.png` `.jpg` `.jpeg`
If two formats exist for the same slug, `.webp` wins.

## devices/ — the 16 filenames

Each page shows its photograph in the "On the bench" plate, cropped to 4:3.

| File to add | Appears on |
|---|---|
| `modem.jpg` | /devices/modem |
| `hub.jpg` | /devices/hub |
| `repeater.jpg` | /devices/repeater |
| `nic.jpg` | /devices/nic |
| `switch.jpg` | /devices/switch |
| `bridge.jpg` | /devices/bridge |
| `access-point.jpg` | /devices/access-point |
| `router.jpg` | /devices/router |
| `layer-3-switch.jpg` | /devices/layer-3-switch |
| `nat-gateway.jpg` | /devices/nat-gateway |
| `firewall.jpg` | /devices/firewall |
| `load-balancer.jpg` | /devices/load-balancer |
| `proxy-server.jpg` | /devices/proxy-server |
| `gateway.jpg` | /devices/gateway |
| `vpn-gateway.jpg` | /devices/vpn-gateway |
| `ids-ips.jpg` | /devices/ids-ips |

Any device without a file keeps its ruled placeholder — the page still works, it
just waits for its art.

## cables/ and connectors/ — required

Unlike devices, these have **no placeholder**. Every cable and connector page is
built around its plate, so a missing file stops `npm run build` with the exact
path to put back. Do not delete these files.

| Folder | Files |
|---|---|
| `cables/` | `coaxial` `fiber-optic` `stp` `utp` |
| `connectors/` | `bnc` `f-type` `lc` `mtp` `rj11` `rj11-vs-rj45` `rj45` `sc` `st` |

Each is a `.webp` today; any accepted format with the same slug works.

## What makes a good photograph here

The design prints them as newsprint halftones on a 4:3 plate, so:

- **Landscape**, roughly 4:3. Portrait shots get cropped top and bottom.
- **1600px wide is plenty.** Bigger only makes the page slower.
- **Plain background** if possible — the halftone treatment flattens busy ones.
- **The whole device in frame**, front or three-quarter view.

## After adding files

The dev server picks them up on the next request. For the production build,
run `npm run build` again — the folder is read at build time.
