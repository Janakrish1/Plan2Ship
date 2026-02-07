from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # SQLite (free, no server) – great for hackathons. Or use PostgreSQL for production.
    database_url: str = "sqlite:///./plc_jira.db"
    secret_key: str = "dev-secret-change-in-prod"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    class Config:
        env_file = ".env"


settings = Settings()
