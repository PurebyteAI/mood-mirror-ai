# Re-export GroqService as OpenRouterService for backward compatibility
from services.groq_service import GroqError as OpenRouterError, GroqService as OpenRouterService, GroqError, GroqService

__all__ = ["OpenRouterError", "OpenRouterService", "GroqError", "GroqService"]
