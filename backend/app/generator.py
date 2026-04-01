import json
import os
import re

from ollama import AsyncClient

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "codellama")

client = AsyncClient(host=OLLAMA_HOST)

SYSTEM_PROMPT = """You are an expert code generator. You generate production-ready, well-structured code for any tech stack.

When given a user requirement and a tech stack, you MUST respond with valid JSON in this exact format:
{
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "content": "full file content here",
      "language": "language name for syntax highlighting"
    }
  ],
  "summary": "Brief 1-2 sentence summary of what was generated"
}

Rules:
- Generate COMPLETE, RUNNABLE code — not stubs or placeholders
- Include ALL necessary files (config, dependencies, entry points, etc.)
- Use modern best practices for the chosen stack
- Include proper error handling and input validation
- Add brief, helpful comments where appropriate
- For web projects, include a README.md with setup instructions
- The "language" field should match common syntax highlighting names (e.g., "typescript", "python", "go", "rust", "yaml", "json", "markdown", "html", "css", "javascript", "dart", "java", "bash", "hcl", "dockerfile")
- Respond ONLY with the JSON object, no markdown code fences or extra text
"""


def _build_user_prompt(prompt: str, stack: str, framework: str | None) -> str:
    parts = [f"Tech Stack: {stack}"]
    if framework:
        parts.append(f"Framework: {framework}")
    parts.append(f"Requirements: {prompt}")
    return "\n".join(parts)


def _extract_json(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown fences and extra text."""
    text = text.strip()

    fence_match = re.search(r"```(?:json)?\s*\n?(.*?)```", text, re.DOTALL)
    if fence_match:
        candidate = fence_match.group(1).strip()
        # Only use fence-extracted text if it contains a parseable JSON object
        if "{" in candidate:
            try:
                json.JSONDecoder().raw_decode(candidate, candidate.find("{"))
                text = candidate
            except json.JSONDecodeError:
                pass  # Fall through to parse the original text

    brace_start = text.find("{")
    if brace_start == -1:
        raise ValueError("No JSON object found in response")

    decoder = json.JSONDecoder()
    try:
        result, _ = decoder.raw_decode(text, brace_start)
        return result
    except json.JSONDecodeError:
        return json.loads(text[brace_start:])


async def generate_code(
    prompt: str, stack: str, framework: str | None = None
) -> dict:
    user_prompt = _build_user_prompt(prompt, stack, framework)

    response = await client.chat(
        model=OLLAMA_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        options={
            "temperature": 0.3,
            "num_predict": 16000,
        },
    )

    raw = response.message.content
    if not raw:
        raise ValueError("Empty response from AI model")

    parsed = _extract_json(raw)

    files = parsed.get("files", [])
    summary = parsed.get("summary", "Code generated successfully.")

    return {
        "files": files,
        "summary": summary,
        "stack": stack,
    }
