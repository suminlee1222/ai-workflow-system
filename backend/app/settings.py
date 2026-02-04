from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # AI 설정
    AI_MODE: str = "mock"
    OPENAI_MODEL: str = "gpt-4.1-mini"
    OPENAI_API_KEY: str | None = None

    # DB 설정
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "ai_workflow"
    DB_USER: str = "ai_user"
    DB_PASSWORD: str = "ai_pass"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+psycopg2://{self.DB_USER}:"
            f"{self.DB_PASSWORD}@{self.DB_HOST}:"
            f"{self.DB_PORT}/{self.DB_NAME}"
        )

    class Config:
        env_file = ".env"

settings = Settings()
