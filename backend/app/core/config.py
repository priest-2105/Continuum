from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    groq_api_key: str = ""
    admin_secret: str = "change-me"

    class Config:
        env_file = ".env"


settings = Settings()
