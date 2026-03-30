import json
import os

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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


async def generate_code(
    prompt: str, stack: str, framework: str | None = None
) -> dict:
    user_prompt = _build_user_prompt(prompt, stack, framework)

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=16000,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content
    if raw is None:
        raise ValueError("Empty response from AI model")

    parsed = json.loads(raw)

    files = parsed.get("files", [])
    summary = parsed.get("summary", "Code generated successfully.")

    return {
        "files": files,
        "summary": summary,
        "stack": stack,
    }
