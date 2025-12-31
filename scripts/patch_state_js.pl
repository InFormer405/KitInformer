use strict;
use warnings;

my $file = shift or die "usage: $0 public/scripts/state.js\n";

local $/;
open my $fh, "<", $file or die "read $file: $!";
my $s = <$fh>;
close $fh;

# --- Fix the SKU split bug: split on - or _
# Handles: .split("-_")[1] and .split("-_")[2]
$s =~ s/\.split\("\-_"\)\[([12])\]/.split(\/[-_]\/)[$1]/g;

# --- Remove TX hardcode and filter products by STATE_NAME + (-WC / -NC)
my $new = <<'JS';
  const stateList = list.filter(p =>
    String(p?.State || p?.Subcategory || "").trim().toLowerCase() === STATE_NAME
  );

  const wc = stateList.find(p => String(p?.SKU || "").toUpperCase().includes("-WC"));
  const nc = stateList.find(p => String(p?.SKU || "").toUpperCase().includes("-NC"));

  // Images
  setCard("txWithChildrenCard", wc);
  setCard("txNoChildrenCard", nc);

  // Prices
  if (wc) setText("txWithChildrenPrice", money(getPrice(wc)) || "$199");
  if (nc) setText("txNoChildrenPrice", money(getPrice(nc)) || "$175");

  // Links
  if (wc) setLink("txWithChildrenLink", getHref(wc, "#"));
  if (nc) setLink("txNoChildrenLink", getHref(nc, "#"));
JS

# Replace the whole "txWC/txNC ... Images/Prices/Links" section.
# This matches from "const txWC" down through the txNoChildrenLink line.
my $re = qr/^\s*const\s+txWC\s*=.*?\n.*?^\s*if\s*\(txNC\)\s*setLink\("txNoChildrenLink".*?\n/ms;

if ($s =~ $re) {
  $s =~ s/$re/$new/ms;
} else {
  die "Could not find txWC/txNC block to replace (pattern mismatch).\n";
}

# Write back with a backup
my $bak = "$file.bak.patch";
open my $out, ">", $bak or die "write $bak: $!";
print $out $s;
close $out;

rename $bak, $file or die "rename: $!";

print "✅ Patched $file\n";
