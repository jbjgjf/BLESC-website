# 共同研究・採択の帯のロゴ / Logos for the "Research and programs" band

トップページの「共同研究・採択」の帯（英語版は "Research and programs"）は、
このフォルダにロゴのファイルがあれば、名前の文字の代わりにロゴを表示します。
ファイルがなければ、今と同じく名前を文字で表示します。

The band on the home page shows an organisation's logo in place of its
typeset name when the file below is in this folder, and the typeset name
when it is not.

## ファイル名 / File names

| 機関 / Organisation | ファイル名 / File name |
| :--- | :--- |
| 京都大学 / Kyoto University | `kyoto-university.svg` または / or `kyoto-university.png` |
| ANOBAKA | `anobaka.svg` または / or `anobaka.png` |

名前はこのとおり、小文字で保存してください。同じ機関の SVG と PNG が両方ある
ときは SVG が使われます。

Save each file under exactly that name, in lower case. If both an SVG and a
PNG are here for the same organisation, the SVG is used.

## 形式 / Format

- **SVG を推奨します。** どの画面でもくっきり表示されます。`<svg>` に
  `viewBox`（または px の `width` と `height`）が必要です。デザインツールから
  書き出した SVG にはふつう入っています。
- PNG の場合は**背景を透明に**してください。ロゴは高さ最大約 47px で表示
  されるので、**高さ 94px 以上**（2 倍）、できれば 3 倍の 141px 以上で書き出して
  ください。
- 余白は付けず、ロゴの形ぎりぎりで切り抜いてください。表示の高さはロゴ全体
  （余白を含む）に合わせるため、余白があるとロゴが小さく見えます。
- 白い背景の上に表示されます。白抜きのロゴは見えません。

- **SVG is preferred**: it stays sharp on every screen. The `<svg>` needs a
  `viewBox` (or a `width` and `height` in px), which design tools write.
- A PNG should have a **transparent background**. The logo is drawn at most about
  47px tall, so export it **at least 94px tall** (2x), or 141px (3x).
- Crop tight to the mark, with no padding: the logo is fitted by its whole
  height, padding included, so padding makes the mark smaller.
- The band is white. A white (reversed) logo will not show.

## ほかに変更は不要です / Nothing else to change

ファイルを置いて公開（デプロイ）すれば、ロゴが表示されます。コードの変更は
いりません。ロゴは名前の代わりに表示され、名前は画像の代替テキストになります。
その下の一行（「京都大学大学院 教育学研究科 附属臨床教育実践研究センターとの
共同研究」「U-25 AI Accelerator 第2期 採択」）はそのまま残ります。

Add the file and deploy; no code changes are needed. The logo replaces the
name, the name becomes the image's alt text, and the line under it — what
the relationship is — stays as it is.

ファイルのサイズを読み取れない場合（SVG に `viewBox` も px の大きさもない、
PNG ではないファイルを `.png` にした、など）は、ビルドがファイル名を示して
止まります。

If a file's size cannot be read (an SVG with no `viewBox` or px size, or a
file that is not really a PNG), the build stops and names the file.

このフォルダの内容はサイトの一部として公開されます（このファイルも
`/backers/README.md` で見られます）。公開してよいものだけを置いてください。

Everything in this folder is published with the site, this file included
(at `/backers/README.md`). Put nothing here that is not meant to be public.
