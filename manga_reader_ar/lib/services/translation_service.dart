import 'dart:convert';
import 'package:dart_openai/dart_openai.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class TranslationService {
	TranslationService._();

	static void init() {
		final apiKey = dotenv.env['OPENAI_API_KEY'];
		if (apiKey == null || apiKey.isEmpty) {
			throw StateError('OPENAI_API_KEY is not set in .env');
		}
		OpenAI.apiKey = apiKey;
	}

	static const supportedDialects = <String>[
		'الفصحى',
		'الشامية',
		'المصرية',
		'الخليجية',
		'المغربية',
	];

	static Future<String> translateToArabic(String sourceText, {String dialect = 'الفصحى'}) async {
		final system = OpenAIChatCompletionChoiceMessageModel(
			role: OpenAIChatMessageRole.system,
			content: [
				OpenAIChatCompletionChoiceMessageContentItemModel.text(
					'You are a professional manga translator. Translate user text to Arabic ($dialect). Keep meaning, tone, onomatopoeia natural. Output plain Arabic without extra commentary.'),
			],
		);

		final user = OpenAIChatCompletionChoiceMessageModel(
			role: OpenAIChatMessageRole.user,
			content: [
				OpenAIChatCompletionChoiceMessageContentItemModel.text(sourceText),
			],
		);

		final res = await OpenAI.instance.chat.create(
			model: 'gpt-4o-mini',
			messages: [system, user],
			temperature: 0.2,
			maxTokens: 500,
		);

		final message = res.choices.first.message;
		final contentItems = message.content ?? [];
		final buffer = StringBuffer();
		for (final item in contentItems) {
			if (item.text != null) buffer.write(item.text);
		}
		return buffer.toString().trim();
	}

	static Future<List<String>> translateBatch(List<String> texts, {String dialect = 'الفصحى'}) async {
		if (texts.isEmpty) return const [];
		final system = OpenAIChatCompletionChoiceMessageModel(
			role: OpenAIChatMessageRole.system,
			content: [
				OpenAIChatCompletionChoiceMessageContentItemModel.text(
					'You translate JSON arrays of strings to Arabic ($dialect). Return a JSON array only, same length and order.'),
			],
		);
		final user = OpenAIChatCompletionChoiceMessageModel(
			role: OpenAIChatMessageRole.user,
			content: [
				OpenAIChatCompletionChoiceMessageContentItemModel.text(texts.toString()),
			],
		);
		final res = await OpenAI.instance.chat.create(
			model: 'gpt-4o-mini',
			messages: [system, user],
			temperature: 0.2,
			maxTokens: 1000,
		);
		final msg = res.choices.first.message;
		final contentItems = msg.content ?? [];
		final buffer = StringBuffer();
		for (final item in contentItems) {
			if (item.text != null) buffer.write(item.text);
		}
		final raw = buffer.toString();
		try {
			final sanitized = raw.trim();
			final List<dynamic> arr = sanitized.startsWith('[') ? (jsonDecode(sanitized) as List<dynamic>) : [];
			return arr.map((e) => e.toString()).toList();
		} catch (_) {
			return [await translateToArabic(texts.join('\n'), dialect: dialect)];
		}
	}
}