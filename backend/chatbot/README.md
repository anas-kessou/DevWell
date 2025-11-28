# DevWell AI Chatbot

## Current Status

The chatbot currently uses **OpenRouter** exclusively with **Llama 3.3 70B** (free tier) for AI capabilities.

## Current Features

- ✅ Health & productivity tips
- ✅ Fatigue management advice
- ✅ Ergonomics guidance
- ✅ Work-life balance suggestions
- ✅ DevWell feature explanations

## Future Vision

DevWell AI will evolve into a **comprehensive developer assistant** that not only improves developer health but also enhances their work quality and productivity.

### Planned Features

#### 🩺 Health & Wellness (Current)

- Physical health monitoring
- Mental health support
- Ergonomic workspace optimization
- Break reminders and activity tracking

#### 💻 Code Assistance (Future)

- Intelligent code completion and suggestions
- Bug detection and debugging help
- Code review and quality improvements
- Performance optimization recommendations
- Best practices enforcement

#### 🔬 Research Assistant (Future)

- Latest development trends and updates
- New framework and library releases
- Security vulnerability alerts
- Technology comparisons and recommendations
- Learning resource suggestions

#### 🎨 Design & Architecture (Future)

- Design pattern recommendations
- Architecture best practices
- Code structure optimization
- Scalability suggestions
- Microservices design guidance

#### 📊 Productivity Enhancement (Future)

- Task prioritization
- Time management tips
- Focus and concentration techniques
- Workflow optimization
- Meeting and collaboration efficiency

## Technical Architecture

### Current Setup

```
Frontend (React)
  → Backend API (Express/TypeScript)
    → Python Service (chat.py)
      → OpenRouter API
        → Llama 3.3 70B
```

### Future Architecture

```
Frontend
  → Intent Router (determines request type)
    → Health Module → OpenRouter (wellness models)
    → Code Module → Specialized code models (GPT-4, CodeLlama, etc.)
    → Research Module → Research-focused models
    → Design Module → Architecture-specialized models
```

## Model Strategy

### Current

- **Primary**: OpenRouter with Llama 3.3 70B (free)
- **Fallback**: None (simplified for reliability)

### Future

- **Health Assistant**: Conversational models (Claude, GPT-4o)
- **Code Assistant**: Code-specialized models (GPT-4, Codex, CodeLlama)
- **Research Assistant**: Research-focused models with web search
- **Design Assistant**: Architecture-aware models

## API Keys

Required environment variable:

```bash
OPENROUTER_API_KEY=your_key_here
```

Get your free API key at: https://openrouter.ai/keys

## Development

### Install Dependencies

```bash
cd /home/kali/Desktop/DevWell/backend/chatbot
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Test Chatbot

```bash
source venv/bin/activate
python3 -c "from chat import chat; import json; print(json.dumps(chat('Hello!', 'auto', []), indent=2))"
```

### Available Models

- `auto` - Default (Llama 3.3 70B)
- `openrouter` - OpenRouter default
- `openrouter:model-name` - Specific OpenRouter model

## Roadmap

### Phase 1: Health & Wellness (✅ Complete)

- [x] Basic chatbot integration
- [x] Health tips and advice
- [x] OpenRouter integration
- [x] Conversation history

### Phase 2: Code Assistance (🚧 Planned)

- [ ] Code analysis integration
- [ ] Syntax error detection
- [ ] Code completion suggestions
- [ ] Debugging assistance
- [ ] Performance optimization tips

### Phase 3: Research & Trends (📋 Future)

- [ ] Tech trend monitoring
- [ ] Library/framework updates
- [ ] Security vulnerability scanning
- [ ] Learning resource recommendations

### Phase 4: Design & Architecture (💡 Future)

- [ ] Design pattern suggestions
- [ ] Architecture reviews
- [ ] Scalability analysis
- [ ] Best practices enforcement

## Contributing

When adding new features:

1. Add model configurations to `OPENROUTER_MODELS`
2. Extend `chat()` function with routing logic
3. Update system prompts for specialized contexts
4. Document new capabilities in this README

## License

Part of the DevWell project.
