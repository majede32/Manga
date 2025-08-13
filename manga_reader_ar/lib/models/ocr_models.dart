import 'dart:ui';

class DetectedTextRegion {
	/// Text content extracted by OCR for this region (e.g., speech bubble text)
	final String text;

	/// Region rectangle normalized to [0,1] relative to image width/height.
	final Rect normalizedRect;

	DetectedTextRegion({required this.text, required this.normalizedRect});
}