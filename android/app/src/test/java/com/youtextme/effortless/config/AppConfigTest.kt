package com.youtextme.effortless.config

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class AppConfigTest {
    @Test
    fun `isProduction is true only for production environment`() {
        assertTrue(
            AppConfig(environment = AppConfig.ENV_PRODUCTION, apiBaseUrl = "https://api/").isProduction,
        )
        assertFalse(
            AppConfig(environment = AppConfig.ENV_DEVELOPMENT, apiBaseUrl = "https://dev/").isProduction,
        )
    }
}
