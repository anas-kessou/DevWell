import os
import requests
import json

"""
DevWell AI Chatbot Service
Currently uses OpenRouter for AI capabilities.
Future: Will expand to support specialized models for code assistance, research, and developer productivity.
"""

# ============================================================
# Load keys
# ============================================================

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ============================================================
# AVAILABLE MODELS
# ============================================================

OPENROUTER_MODELS = {
    "default": "meta-llama/llama-3.3-70b-instruct:free",
    "llama": "meta-llama/llama-3.3-70b-instruct:free",
    "qwen": "qwen/qwen-2.5-7b-instruct:free",
    # Future: Add specialized models for code assistance, research, etc.
}

# ============================================================
# MAIN CHAT HANDLER
# ============================================================

def chat(prompt: str, model: str = 'auto', conversation_history: list = []):
    """
    Main chat function - uses OpenRouter exclusively.
    
    Args:
        prompt: User's message
        model: 'auto', 'gemini', 'llama', 'openrouter', or 'openrouter:model-name'
        conversation_history: List of previous messages for context
    
    Returns:
        Dict with success, response, and model fields
    
    Future: Will route to specialized models based on request type
    (code assistance, health tips, research, design trends, etc.)
    """
    try:
        if not OPENROUTER_API_KEY:
            return {
                "success": False,
                "response": "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to .env file."
            }
        
        # Map all model names to OpenRouter models
        model_map = {
            'auto': OPENROUTER_MODELS['default'],
            'openrouter': OPENROUTER_MODELS['default'],
            'gemini': OPENROUTER_MODELS['default'],
            'llama': OPENROUTER_MODELS['llama']
        }
        
        # Handle specific OpenRouter model selection
        if model.startswith('openrouter:'):
            custom_model = model.split(':', 1)[1]
            result = ask_openrouter(custom_model, prompt, conversation_history)
            result['model'] = custom_model
            return result
        
        # Use model mapping or default
        selected_model = model_map.get(model, OPENROUTER_MODELS['default'])
        result = ask_openrouter(selected_model, prompt, conversation_history)
        result['model'] = model if model in model_map else 'openrouter'
        return result

    except Exception as error:
        return {
            "success": False,
            "response": f"Error: {str(error)}"
        }

# ============================================================
# OPENROUTER
# ============================================================

def ask_openrouter(model, prompt, history):
    """
    Send request to OpenRouter API.
    
    Future: Can be extended to use different system prompts based on request type:
    - Health & productivity tips
    - Code assistance & debugging
    - Research & latest tech trends
    - Design patterns & best practices
    - Given great innovative ideas
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "DevWell AI Assistant",
    }

    # Future: Dynamic system prompt based on conversation context
    messages = [{"role": "system", "content": "You are DevWell AI Assistant. You help developers improve their health, productivity, and coding skills. Provide practical advice on work-life balance, ergonomics, code quality, and the latest development trends."}]
    
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": prompt})

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        json={"model": model, "messages": messages},
        headers=headers,
    )

    data = response.json()
    
    # Check for errors
    if "error" in data:
        return {
            "success": False,
            "response": f"OpenRouter error: {data['error'].get('message', str(data['error']))}"
        }
    
    # Check if response has expected structure
    if "choices" not in data or len(data["choices"]) == 0:
        return {
            "success": False,
            "response": f"Invalid response from OpenRouter: {json.dumps(data)}"
        }

    return {
        "success": True,
        "response": data["choices"][0]["message"]["content"]
    }

