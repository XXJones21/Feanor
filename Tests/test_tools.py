import openai

# Point to our proxy instead of directly to LM Studio
openai.api_base = "http://localhost:4892/v1"
openai.api_key = "not-needed"

response = openai.ChatCompletion.create(
    model="local-model",
    messages=[
        {"role": "user", "content": "Can you read and analyze this PDF file: Source/Newwhitepaper_Agents2.pdf?"}
    ]
)

print(response.choices[0].message) 