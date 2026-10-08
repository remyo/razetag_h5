// Adapt the shareable end-user guide for this static website.
// Embedded pictures become separate cacheable files; the original stays intact.
//
// Local enrichment, audited 8 October 2026 against app revision 797f06b:
// the September source remains the screenshot/provenance authority. This file
// owns current website-only copy for Listing tools, Showcase, Shop team, styled
// QR labels, and spreadsheet reports. Do not edit the app guide to regenerate
// this website. Run: node scripts/sync-guide.mjs ../razetag/docs/RazeTag-Features.html
// All source screenshots are preserved byte-for-byte; no new captures are made.
// When the upstream guide changes, review the guarded markers and this copy
// against tools_screen.dart, listing_tools_screen.dart, showcase_* screens,
// shop_team_screen.dart / docs/shop-team.md, csv_export_section.dart, and
// qr_label_preview_screen.dart / docs/qr-label-styles.md before accepting it.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv[2]) throw new Error('Pass the RazeTag-Features.html source path.');
const source = resolve(process.argv[2]);
const output = resolve(root, 'guide.html');
if (source === output) throw new Error('Use the original end-user guide, not the generated web copy.');
let html = readFileSync(source, 'utf8');
const originalHash = createHash('sha256').update(html).digest('hex');
const sourceChapterCount = (html.match(/class="chapter(?:\s|\")/g) || []).length;
const screenCount = (html.match(/\bdata-screen=/g) || []).length;
if (sourceChapterCount !== 15 || screenCount !== 30) throw new Error(`Review the guide structure before syncing: ${sourceChapterCount} chapters, ${screenCount} screenshots.`);
if (!html.includes('Your everyday guide')) throw new Error('Unexpected guide source.');
const plainSource = html.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, '');
if (/\/Users\/|file:\/\/|localhost|127\.0\.0\.1|<iframe\b/i.test(plainSource)) throw new Error('Local-only reference found in the shareable guide.');
function replaceOnce(from, to) {
  if (!html.includes(from) || html.indexOf(from) !== html.lastIndexOf(from)) throw new Error(`Expected one source marker: ${from.slice(0,80)}`);
  html = html.replace(from, () => to);
}
replaceOnce('<title>RazeTag — Your everyday guide</title>', '<title>RazeTag — User guide</title>');
replaceOnce('Your friendly guide to RazeTag: add stock, organize purchases, record sales, track your money, and keep a safe copy of your inventory.', 'Practical RazeTag walkthroughs: add stock, prepare listings, show products to customers, work with your shop team, record sales, and protect your inventory.');
replaceOnce('<a class="brand" href="#welcome">', '<a class="brand" href="index.html" aria-label="Back to RazeTag home">');
replaceOnce('<div class="top-actions">', '<div class="top-actions"><a class="button quiet guide-home" href="index.html">← Home</a>');
replaceOnce('<a href="#welcome">Back to top ↑</a></footer>', '<a href="index.html">← Back to RazeTag</a><a href="privacy.html">Privacy Policy</a><a href="mailto:razedevworkspace@gmail.com">Support</a><a href="#welcome">Back to top ↑</a></footer>');
replaceOnce('</head>', `  <style id="website-navigation">
    :root{--ink:#211b32;--muted:#706a7d;--line:#e8e4ed;--page:#faf9fc;--radius:16px}
    .topbar{height:auto;min-height:78px;padding-block:12px;flex-wrap:wrap;background:#fff}
    .top-actions{flex-wrap:wrap;max-width:100%}
    .button{border-radius:8px}
    .guide-home{white-space:nowrap}
    .chapter.welcome{padding-top:54px}
    .welcome-bottom{background:#f0eafa;border:1px solid #e5dcf0}
    .guide-chooser{grid-column:1/-1;padding:30px;background:#fff;border:1px solid var(--line);border-radius:20px}
    .guide-chooser h2{font-size:1.65rem;margin-bottom:8px}
    .guide-chooser>p{font-size:.88rem;color:var(--muted);margin-bottom:22px}
    .use-case-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .use-case-grid a{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 18px;background:var(--page);border:1px solid var(--line);border-radius:12px;min-width:0;color:var(--ink)}
    .use-case-grid a:hover{background:var(--pale);border-color:#cdbbE8;text-decoration:none}
    .use-case-grid strong{font-size:.92rem;display:block;line-height:1.4}
    .use-case-grid small{display:block;font-size:.74rem;color:var(--muted);margin-top:5px;line-height:1.6}
    .use-case-grid a>span:last-child{font-size:1.2rem;color:var(--purple);flex:none}
    .welcome>.note{grid-column:1/-1;margin:0}
    .task-paths{display:grid;gap:0;margin:0 0 28px;padding:0;list-style:none;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}
    .task-paths li{padding:16px 18px;border-bottom:1px solid var(--line);min-width:0}
    .task-paths li:last-child{border-bottom:0}
    .task-paths strong{display:block;font-size:.93rem}
    .task-paths p{font-size:.82rem;color:var(--muted);margin:5px 0 0;line-height:1.7}
    .task-paths .path{margin:8px 0 0;font-size:.72rem}
    .role-table{width:100%;border-collapse:collapse;font-size:.84rem;margin:24px 0}
    .role-table th,.role-table td{padding:15px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
    .role-table th{font-weight:700;background:var(--pale)}
    .role-table td:first-child{font-weight:700;width:100px;color:var(--deep)}
    .role-table td:last-child{color:var(--muted)}
    .current-steps{max-width:860px}
    .current-steps .steps p{max-width:700px}
    .page-footer{line-height:1.7}
    @media(max-width:900px){.chapter.welcome{padding-top:38px}}
    @media(max-width:600px){.guide-chooser{padding:22px}.use-case-grid{grid-template-columns:1fr}.use-case-grid a{padding:14px}.role-table th,.role-table td{padding:12px 8px}.role-table td:first-child{width:70px}}
    @media(max-width:600px){.topbar{min-height:72px}.chapter{scroll-margin-top:150px}}
    @media print{.guide-chooser,.task-paths{break-inside:avoid}.use-case-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.topbar{display:none}}
  </style>
</head>`);

// Current task chooser and a short first-run routine; the old screens remain
// illustrative examples rather than claims to depict the October interface.
replaceOnce('<h1>A little less guesswork.<br><span>A lot more clarity.</span></h1>', '<h1>Your next step.<br><span>Made a little clearer.</span></h1>');
replaceOnce('From your latest find to your next sale, RazeTag keeps the details together. Track stock and part-payments, then bring the work to your Mac.', 'Start with one item, prepare a listing, or pick up the workflow you need today. These short walkthroughs keep your stock, sales, and private details straight.');
replaceOnce('<span class="mini-label">A SIMPLE ROUTINE</span><h2>Add it. Keep track. Sell with confidence.</h2>', '<span class="mini-label">YOUR FIRST FIVE MINUTES</span><h2>One item. One clear routine.</h2>');
replaceOnce('<span>Add what you bought<small>Photos, costs, and quantity</small></span>', '<span>Save your first item<small>Add → Create details manually</small></span>');
replaceOnce('<span>Keep stock organized<small>Categories, bundles, and status</small></span>', '<span>Find it in Inventory<small>Open it and check quantity, cost, and photos</small></span>');
replaceOnce('<span>Record what you sold<small>Fees, profit, and remaining stock</small></span>', '<span>Record a real sale<small>Enter quantity sold and the total paid</small></span>');
replaceOnce('<p class="capture-note">The app screens in this guide use demonstration data, not someone’s personal inventory. Tap any screen to see it larger.</p>', `<div class="guide-chooser" aria-labelledby="use-case-title"><span class="mini-label">PICK YOUR WORKFLOW</span><h2 id="use-case-title">What would you like to do?</h2><p>Jump straight to the task. Or choose Present guide above to read one chapter at a time.</p><nav class="use-case-grid" aria-label="Choose a task">
          <a href="#first-item"><span><strong>Add new stock</strong><small>Save costs, photos, and quantity</small></span><span aria-hidden="true">↗</span></a>
          <a href="#tools"><span><strong>Prepare a marketplace post</strong><small>Listing text, photos, QR labels, or a bundle</small></span><span aria-hidden="true">↗</span></a>
          <a href="#showcase"><span><strong>Show products to a customer</strong><small>A customer view without purchase details</small></span><span aria-hidden="true">↗</span></a>
          <a href="#selling"><span><strong>Record a sale or part-payment</strong><small>Sold quantity, money received, and delivery</small></span><span aria-hidden="true">↗</span></a>
          <a href="#sync"><span><strong>Work on your phone and Mac</strong><small>Full-inventory sync between trusted devices</small></span><span aria-hidden="true">↗</span></a>
          <a href="#shop-team"><span><strong>Give staff selling access</strong><small>Owner, Manager, and Staff permissions</small></span><span aria-hidden="true">↗</span></a>
          <a href="#money"><span><strong>Check your numbers</strong><small>Profit, buying allowance, and cash flow</small></span><span aria-hidden="true">↗</span></a>
          <a href="#safe"><span><strong>Export a report or safe copy</strong><small>Excel / CSV reports are different from backups</small></span><span aria-hidden="true">↗</span></a>
        </nav></div>
        <p class="capture-note">These September 2026 app screens use demonstration data, not personal inventory. Current layouts and controls may vary; follow the written steps. Tap any screen to see it larger.</p>`);
replaceOnce('<div class="note"><strong>Already using RazeTag? Catch up on what’s new.</strong><p>Explore <a href="#inventory">stock history and restocking</a>, <a href="#deliveries">part-payments</a>, <a href="#money">fixed currency conversion</a>, <a href="#sync">local sync</a>, and <a href="#desktop">the Mac workspace</a>.</p><p class="fine">Guide revised 22 September 2026.</p></div>', '<div class="note"><strong>Already using RazeTag? Here’s what changed.</strong><p><a href="#tools">Listing tools</a> brings copying, QR labels, and bundle planning into one browser. Try <a href="#showcase">Showcase</a> for customer browsing, <a href="#shop-team">Shop team</a> for permission-based selling, and <a href="#safe">Excel reports</a> for readable exports.</p><p class="fine">Written steps reviewed 8 October 2026. Existing demo captures retained.</p></div>');

// Keep the existing Tools screenshots and dialogs, but replace the obsolete
// separate Copy listing / QR labels / Bundle planner navigation with one path.
replaceOnce('<p>Open Tools for practical shortcuts that sit alongside your inventory.</p>', '<p>Start with Listing tools to prepare stock for sale. Other tools help you track work, spending, and grading.</p>');
replaceOnce('<div class="tool-list"><article>', `<p class="path">Tools → Listing tools</p><ol class="task-paths" aria-label="Listing tools actions"><li><strong>Copy a listing</strong><p>Search or choose a category, then tap the item’s copy button. Review the public description and selling price. Choose Copy text, Share photos + text, or Save photos; these prepare a post but never publish it for you.</p></li><li><strong>Create a printable QR label</strong><p>Tap the QR button beside an item. Choose Print style, then Save label to export the label image. Scan a shelf label with the scanner button in Listing tools on a phone.</p></li><li><strong>Plan a combined sale</strong><p>Choose Bundle planner (shown as Bundle on a narrow screen), select at least two eligible listings in one currency, then tap Plan bundle. Review the proposed total and deductions before Continue to bundle sale. Cancel leaves stock unchanged.</p></li></ol><div class="tool-list"><article>`);
replaceOnce('<h3>Copy listing</h3><p>Choose an available item, review the description, and copy it for your marketplace post. Check selling price and condition before sharing. Private buying details are excluded. Share photos + text or Save photos helps prepare your post, but does not publish it automatically. Review photos for private content; existing location metadata is not removed.</p>', '<h3>Private details stay out of listing text</h3><p>Purchase costs, seller details, storage location, and private notes are excluded from the public description. Review the generated text and your photos before sharing; photos can reveal private content, and existing location metadata is not removed.</p>');
replaceOnce('<h3>QR labels</h3><p>Choose an item and preview its printable label. Scan its RazeTag QR to open the saved product. Labels avoid exposing the purchase price.</p>', '<h3>QR print styles</h3><p>Choose Classic, Rounded, or Dots patterns; Black, Forest, or Indigo ink; Item label or QR only; and an optional Centre logo. Switch off the logo for very small labels. Print on white, keep the clear margin, and test one physical label before a batch.</p>');
replaceOnce('<h3>Bundle planner</h3><p>Select items you already own and compare a combined selling price, deductions, and expected profit. Choose Continue to bundle sale when you’re ready; planning alone doesn’t change your stock.</p>', '<h3>Your plan is not a sale</h3><p>Bundle selections and planner scenarios are temporary. Stock changes only after you continue to the sale flow, review it, and confirm. Items that cannot join the proposed bundle remain unavailable for selection.</p>');
replaceOnce('<div class="note"><strong>A QR label points to your saved record.</strong><p>It is not automatically a public product page. Another phone needs the corresponding inventory record; local sharing can help transfer it.</p></div>', '<div class="note"><strong>A QR label is a local record link, not a public product page.</strong><p>The code contains only the item’s RazeTag ID—not prices, location, notes, seller details, barcode, or serial number. Another phone needs the matching active inventory record. Local sharing can transfer it. The printed Item label still shows the product name, category, and condition.</p><p>Save label saves a PNG to Photos on a phone or offers Save As on Mac. On iOS, label saving asks only to add photos; Android uses the RazeTag Labels album. Print-style choices stay on this device.</p></div>');

// Reports retain the upstream example picture; the current format picker and
// buttons are explained in text, without inventing a screenshot of them.
replaceOnce('Save backups, CSV reports, and exported photos through the Mac’s file dialogs.', 'Save backups, Excel or CSV reports, QR labels, and exported photos through the Mac’s file dialogs.');
replaceOnce('<h3>Know what you’re sharing</h3><p>A CSV report is useful in a spreadsheet, but it is unencrypted, is not a complete restorable backup, and can contain private financial details.</p><p class="tip">For a public sales post, use Copy listing instead.</p>', '<h3>Reports are not backups</h3><p>Excel and CSV reports are readable, unencrypted exports and can contain private financial details. They cannot restore the app or its photos.</p><p class="tip">For a public sales post, use Tools → Listing tools → the item’s copy button instead.</p>');
replaceOnce('<div class="chapter-band"><div><p class="eyebrow">PRIVACY &amp; CLEANUP</p>', `<div class="current-steps"><h3>Export a spreadsheet report</h3><p class="path">Settings → Backup &amp; reports → Spreadsheet reports</p><ol class="steps"><li><h3>Choose a file format</h3><p>Select Excel (.xlsx) for status-colored rows, column filters, and a fixed header row, or CSV (.csv) for plain data.</p></li><li><h3>Choose the records</h3><p>Tap Inventory Excel or Sales Excel (the button names change to CSV for that format). Choose where to save the file and wait for the confirmation.</p></li><li><h3>Store the export securely</h3><p>Reports always use your personal inventory, even while Demo mode is open. Check the file before sending it to anyone; use a full RazeTag backup for recovery.</p></li></ol></div>
        <div class="chapter-band"><div><p class="eyebrow">PRIVACY &amp; CLEANUP</p>`);
replaceOnce('<h4>Photos / gallery</h4><p>For choosing your pictures or saving a copy. Access depends on your phone and the action you choose.</p>', '<h4>Photos / gallery</h4><p>For importing pictures or saving exports. The permission depends on the action: on iOS, QR label saving uses add-only access; exporting listing photos to an album can require broader Photos access. Denial does not remove saved inventory.</p>');
replaceOnce('<h4>Local network</h4><p>For nearby-device discovery, local sharing, and sync. Each new sharing or sync session still needs your approval.</p>', '<h4>Local network</h4><p>For discovery, selected sharing, sync, and Shop team on the same Wi-Fi. Pair and approve the devices; being nearby does not authorize a connection. Guest networks may prevent devices from reaching each other.</p>');
replaceOnce('<h4>Device authentication</h4><p>For protected actions when App protection is enabled.</p>', '<h4>Device authentication</h4><p>For actions protected by App protection and for unlocking a locked Showcase. Your phone’s PIN, passcode, fingerprint, or Face ID is handled by the device.</p>');
replaceOnce('<span>Demo screens · September 2026</span>', '<span>Steps reviewed · October 2026<br>Demo screens · September 2026</span>');

const showcaseChapter = `      <section id="showcase" class="chapter" data-title="Show products to customers">
        <div class="section-heading"><p class="eyebrow">10 / THE CUSTOMER VIEW</p><h2>Show the product.<br>Keep the buying details private.</h2><p>Showcase is a read-only product browser on your device. Choose the stock a customer can see, then hand over the phone with confidence about what is displayed.</p></div>
        <div class="current-steps"><p class="path">Tools → Showcase</p><ol class="steps">
          <li><h3>Choose what goes on display</h3><p>Tap Add items in an empty Showcase, or open the settings cog → Manage showcase items. Search and select your products, then Save. Select all matches uses the current search; Clear selection clears the whole draft. Removing an item from Showcase does not delete it from Inventory.</p></li>
          <li><h3>Browse in grids or cards</h3><p>Search by name or card set, choose a category, and switch between the grid and cards buttons. Swipe through cards or use the arrows. Tap a product for its larger public preview; tap the preview or backdrop again to close it. Back, or Escape on Mac, also closes the preview.</p></li>
          <li><h3>Set the customer view</h3><p>Open the settings cog to change Show selling prices, Show product details, Show mascot, and Mascot style. Review your photos and any custom fields marked for public listings before showing them.</p></li>
          <li><h3>Lock before handing over</h3><p>Settings cog → Lock showcase → Lock. Authenticate with your device’s PIN, passcode, fingerprint, or Face ID. The lock keeps navigation to private app pages out of Showcase and survives closing and reopening the app. Tap the padlock and authenticate again to unlock.</p></li>
        </ol></div>
        <div class="comparison"><article><h3>Selected stock only</h3><p>Only the eligible products you chose appear. Sold, archived, and out-for-grading items stay hidden. Newly added inventory does not join Showcase automatically.</p></article><article><h3>Public listing fields</h3><p>Purchase costs, seller details, storage location, private notes, serial numbers, and grading certificate numbers stay out of the view. Photos and public custom fields still need your review.</p></article><article><h3>No publishing or sales</h3><p>Showcase does not publish a website, send inventory to a customer’s device, or record a sale. Unlock and use the normal sale flow when the buyer is ready.</p></article></div>
        <div class="note warning"><strong>Showcase lock is an app view lock, not a phone lock.</strong><p>It needs working device authentication. It does not prevent screenshots, leaving the app, or access to other phone apps. Use your phone’s separate app-pinning or Guided Access controls if you need that restriction.</p></div>
      </section>

`;
const shopChapter = `      <section id="shop-team" class="chapter" data-title="Work with your shop team">
        <div class="section-heading"><p class="eyebrow">13 / SELLING WITH A TEAM</p><h2>One owner.<br>The right access for each teammate.</h2><p>Shop team gives another device a limited selling catalog. It is different from full-inventory sync: the owner’s app checks permissions and stock before confirming each change.</p></div>
        <div class="current-steps"><p class="path">On both devices: Settings → Local network → Shop team</p><ol class="steps">
          <li><h3>Back up and choose the owner</h3><p>Back up both devices first. If you already have unrestricted shared copies, reconcile them with ordinary Sync devices before changing workflows. On the owner device, choose Set up shop, enter a Shop name, check Use this phone as the shop owner, then Create shop. Its current inventory becomes the shop’s master record.</p></li>
          <li><h3>Invite the member device</h3><p>Owner: Invite / reconnect. Member: Join shop. Keep both updated apps open and unlocked on the same Wi-Fi, then pair with the displayed QR or nearby-device code.</p></li>
          <li><h3>Agree on permissions</h3><p>The owner chooses Choose role, selects Manager or Staff, adjusts permissions and the offline policy, then Save role. The member reads the role and policy and taps Accept role. The catalog is not shared before acceptance.</p></li>
          <li><h3>Record work while connected</h3><p>From a catalog product, choose Sell, enter Quantity sold and Total selling amount, then Confirm sale. This is the total for the sold quantity, not a per-piece price. Only the actions the owner allowed are available. Refresh to reload the catalog.</p></li>
        </ol></div>
        <table class="role-table"><caption class="mini-label">ROLE STARTING POINTS — THE OWNER CAN CUSTOMIZE MEMBER PERMISSIONS</caption><thead><tr><th scope="col">Role</th><th scope="col">What it means</th></tr></thead><tbody><tr><th scope="row">Owner</th><td>Keeps the master inventory, grants access, and handles full product details, photos, backups, physical returns, and permanent deletion. Ownership cannot be granted by invitation.</td></tr><tr><th scope="row">Manager</th><td>Starts with all supported member permissions. If Remove staff from this shop is allowed, can remove Staff—not the Owner, themselves, or another Manager.</td></tr><tr><th scope="row">Staff</th><td>Starts with Record sales only. The owner can enable other supported actions individually; Staff cannot manage memberships.</td></tr></tbody></table>
        <details><summary>Which actions can the owner allow?</summary><p>Record sales; Add products; Edit product names; Change selling prices; Choose a different sale amount; Record money refunds; View purchase costs; Copy the selling catalog; and, for Managers only, Remove staff from this shop.</p><p>Add product creates a basic product; the owner adds photos, costs, and full details. Copy catalog copies names, quantities, and selling prices—not purchase costs or a restorable backup. A money refund uses Total refunded, the cumulative refund for that sale, not a new amount to add. It does not return stock.</p></details>
        <div class="comparison"><article><h3>A separate catalog</h3><p>The member copy stays separate from personal inventory and currently has no product photos. Purchase costs are not sent unless View purchase costs is allowed.</p></article><article><h3>A foreground connection</h3><p>One owner session connects with one member at a time. Re-pair after stopping, locking, backgrounding, or session expiry. This is not cloud sync or an always-on connection.</p></article><article><h3>An agreed offline policy</h3><p>The owner sets Lock after days without sync and optional removal of an expired downloaded catalog. Removal affects the downloaded catalog, not personal inventory or the owner’s records.</p></article></div>
        <div class="note warning"><strong>Interrupted sale? Check it before recording again.</strong><p>Reconnect and use Check / retry request for the pending action. If it cannot be verified after a restore or lost access, use Review with owner and compare the owner’s stock and sales history before choosing Already recorded or Not recorded. Do not create a second sale to guess the outcome.</p></div>
        <details><summary>Leaving, revoking, or ending the shop</summary><p>The owner can change permissions or remove a member. Leave shop clears the member’s downloaded copy; leaving offline still needs the owner to revoke that device separately. Dissolve shop ends team access but preserves the owner’s inventory, photos, and financial history.</p><p>A disconnected device keeps its last accepted offline policy until authenticated contact. Roles cannot recall unrestricted copies previously received through sync or backups, or exported files. This is not a remote-wipe guarantee. An owner backup restore requires fresh member approval.</p></details>
      </section>

`;
replaceOnce('      <section id="sharing" class="chapter"', `${showcaseChapter}      <section id="sharing" class="chapter"`);
replaceOnce('      <section id="desktop" class="chapter"', `${shopChapter}      <section id="desktop" class="chapter"`);
replaceOnce('<a href="#sharing">10 · Share nearby</a>', '<a href="#showcase">10 · Customer Showcase</a><a href="#sharing">11 · Share nearby</a>');
replaceOnce('<a href="#sync">11 · Keep devices in sync</a>', '<a href="#sync">12 · Keep devices in sync</a><a href="#shop-team">13 · Shop team</a>');
replaceOnce('<a href="#desktop">12 · Your desktop workspace</a>', '<a href="#desktop">14 · Your desktop workspace</a>');
replaceOnce('<a href="#settings">13 · Make it personal</a>', '<a href="#settings">15 · Make it personal</a>');
replaceOnce('<a href="#safe">14 · Keep it safe</a>', '<a href="#safe">16 · Keep it safe</a>');
for (const [from, to] of [['10 / BETTER TOGETHER','11 / BETTER TOGETHER'],['11 / ONE INVENTORY, TWO DEVICES','12 / ONE INVENTORY, TWO DEVICES'],['12 / MORE ROOM TO WORK','14 / MORE ROOM TO WORK'],['13 / MAKE IT FEEL LIKE YOURS','15 / MAKE IT FEEL LIKE YOURS'],['14 / A SMALL HABIT THAT MATTERS','16 / A SMALL HABIT THAT MATTERS']]) replaceOnce(from, to);
replaceOnce('Sync is a two-way session for your full inventory—not a one-time selection of items and not a cloud account.', 'Sync is a two-way session for your full inventory, including private details. Use it for your own trusted devices—not to give a teammate restricted selling access. Choose Shop team for that.');
replaceOnce('Sync keeps inventory aligned; it does not make the two devices’ settings identical.', 'Sync keeps inventory aligned; it does not make the two devices’ settings identical. For limited selling access without a full private copy, use Shop team instead.');

const chapterCount = (html.match(/class="chapter(?:\s|\")/g) || []).length;
if (chapterCount !== 17 || (html.match(/\bdata-screen=/g) || []).length !== screenCount) throw new Error('Enrichment changed the expected chapter or screenshot count.');

const assets = new Map();
html = html.replace(/\b(src|href)="data:(image\/(?:png|jpeg|svg\+xml));base64,([A-Za-z0-9+/=]+)"/g, (_, attr, mime, base64) => {
  const bytes = Buffer.from(base64, 'base64');
  const digest = createHash('sha256').update(bytes).digest('hex').slice(0,20);
  const extension = {'image/png':'png','image/jpeg':'jpg','image/svg+xml':'svg'}[mime];
  const relative = `images/guide/${digest}.${extension}`;
  assets.set(relative, bytes);
  return `${attr}="${relative}"`;
});
if (assets.size < 29 || assets.size > screenCount + 1 || /data:image\//.test(html)) throw new Error('Unexpected or unextracted guide assets.');
for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(script);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate guide IDs.');
for (const [, anchor] of html.matchAll(/\bhref="#([^"]+)"/g)) if (!ids.includes(anchor)) throw new Error(`Broken guide anchor: ${anchor}`);
mkdirSync(resolve(root, 'images/guide'), {recursive:true});
for (const [relative, bytes] of assets) writeFileSync(resolve(root, relative), bytes);
writeFileSync(output, html);
console.log(JSON.stringify({output,sourceChapters:sourceChapterCount,chapters:chapterCount,screenshots:screenCount,assets:assets.size,htmlBytes:Buffer.byteLength(html),sourceSha256:originalHash,enrichmentReviewed:'2026-10-08',appRevision:'797f06b'},null,2));
