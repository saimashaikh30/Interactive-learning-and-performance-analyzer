from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

MODEL_NAME = "vennify/t5-base-grammar-correction"

_tokenizer = None
_model = None


def load_grammar_model():
    global _tokenizer, _model

    if _model is None:
        print("Loading grammar model...")

        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

        print("Grammar model loaded.")

    return _tokenizer, _model


def grammar_check_question(question: str):
    tokenizer, model = load_grammar_model()

    question = question.strip()

    if not question:
        return {
            "ok": False,
            "corrected_text": "",
            "errors": ["Question cannot be empty."]
        }

    prompt = f"grammar: {question}"

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=128
    )

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=128,
            num_beams=5,
            early_stopping=True
        )

    corrected = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    ).strip()

    if corrected and corrected[-1] not in ".?!":
        corrected += "?"

    if corrected == question:
        return {
            "ok": True,
            "corrected_text": corrected,
            "errors": []
        }

    return {
        "ok": False,
        "corrected_text": corrected,
        "errors": ["Grammar correction suggested."]
    }