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

	static Future<String> translateToArabic(String sourceText, {String? dialect}) async {
		final system = OpenAIChatCompletionChoiceMessageModel(
			role: OpenAIChatMessageRole.system,
			content: [
				OpenAIChatCompletionChoiceMessageContentItemModel.text(
					'You are a professional manga translator. Translate user text to Arabic${dialect != null ? ' ($dialect dialect)' : ''}. Preserve meaning, tone, and onomatopoeia naturally. Output plain Arabic text.'),
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
}