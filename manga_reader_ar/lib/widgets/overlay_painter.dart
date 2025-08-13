import 'package:flutter/material.dart';
import '../models/ocr_models.dart';

class TextRegionsOverlayPainter extends CustomPainter {
	final List<DetectedTextRegion> regions;
	final Size imageSize;
	final Map<int, String>? translatedByIndex;
	final Color boxColor;

	TextRegionsOverlayPainter({
		required this.regions,
		required this.imageSize,
		this.translatedByIndex,
		this.boxColor = Colors.tealAccent,
	});

	@override
	void paint(Canvas canvas, Size size) {
		final paint = Paint()
			..color = boxColor.withOpacity(0.6)
			..style = PaintingStyle.stroke
			..strokeWidth = 2.0;
		final fillPaint = Paint()
			..color = Colors.black.withOpacity(0.35)
			..style = PaintingStyle.fill;

		final textPainter = TextPainter(
			textDirection: TextDirection.rtl,
			maxLines: 3,
		);

		for (var i = 0; i < regions.length; i++) {
			final r = regions[i];
			final rect = Rect.fromLTWH(
				r.normalizedRect.left * size.width,
				r.normalizedRect.top * size.height,
				r.normalizedRect.width * size.width,
				r.normalizedRect.height * size.height,
			);
			canvas.drawRect(rect, paint);
			canvas.drawRect(rect, fillPaint);

			final translated = translatedByIndex != null ? translatedByIndex![i] : null;
			if (translated != null && translated.isNotEmpty) {
				textPainter.text = TextSpan(
					text: translated,
					style: const TextStyle(color: Colors.white, fontSize: 12),
				);
				textPainter.layout(maxWidth: rect.width - 8);
				textPainter.paint(canvas, Offset(rect.right - textPainter.width - 4, rect.top + 4));
			}
		}
	}

	@override
	bool shouldRepaint(covariant TextRegionsOverlayPainter oldDelegate) {
		return oldDelegate.regions != regions || oldDelegate.translatedByIndex != translatedByIndex || oldDelegate.imageSize != imageSize;
	}
}