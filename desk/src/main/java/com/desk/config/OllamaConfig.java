package com.desk.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Ollama 설정 클래스
 * 환경 변수로부터 Ollama 관련 설정을 주입받음
 */
@Configuration
@Getter
public class OllamaConfig {
    
    @Value("${ai.ollama.url:http://127.0.0.1:11434}")
    private String baseUrl;
    
    @Value("${ai.ollama.model-name:qwen3:8b}")
    private String modelName;
    
    @Value("${ai.ollama.api-key:}")
    private String apiKey;
}

