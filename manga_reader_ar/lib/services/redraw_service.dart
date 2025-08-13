import 'dart:io';
import 'dart:ui' as ui show Color;
import 'package:image/image.dart' as img;

class RedrawService {
	static int _estimateStringWidth(String s, img.BitmapFont font) {
		var width = 0;
		for (final code in s.codeUnits) {
			final ch = font.characters[code];
			width += ch?.xAdvance ?? (font.base ~/ 2);
		}
		return width;
	}

	/// Draws Arabic [text] on top of [imagePath] within the given [boundingBox].
	/// Returns the path to a new PNG image.
	static Future<String> drawTextOnImage({
		required String imagePath,
		required String text,
		required Rectangle boundingBox,
		ui.Color color = const ui.Color(0xFFFFFFFF),
	}) async {
		final bytes = await File(imagePath).readAsBytes();
		final original = img.decodeImage(bytes)!;
		final canvas = img.copyResize(
			original,
			width: original.width,
			height: original.height,
		);

		final imgColor = img.ColorRgba8(color.red, color.green, color.blue, color.alpha);
		final font = img.arial24;
		final maxWidth = boundingBox.width.toInt();

		final words = text.split(' ');
		final lines = <String>[];
		var current = '';
		for (final w in words) {
			final test = current.isEmpty ? w : '$current $w';
			final wSize = _estimateStringWidth(test, font);
			if (wSize > maxWidth && current.isNotEmpty) {
				lines.add(current);
				current = w;
			} else {
				current = test;
			}
		}
		if (current.isNotEmpty) lines.add(current);

		var y = boundingBox.top.toInt() + 4;
		for (final line in lines) {
			final lineWidth = _estimateStringWidth(line, font);
			final x = boundingBox.left.toInt() + (maxWidth - lineWidth);
			img.drawString(canvas, line, font: font, x: x, y: y, color: imgColor, rightJustify: false);
			y += font.base + 6;
		}

		final outPath = imagePath.replaceFirst(RegExp(r'\.(jpg|jpeg|png)$', caseSensitive: false), '_translated.png');
		final outBytes = img.encodePng(canvas);
		await File(outPath).writeAsBytes(outBytes);
		return outPath;
	}
}

class Rectangle {
	final double left;
	final double top;
	final double width;
	final double height;
	const Rectangle({required this.left, required this.top, required this.width, required this.height});
}