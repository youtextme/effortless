package com.youtextme.effortless.ui.home

import com.youtextme.effortless.config.AppConfig
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test

class HomeViewModelTest {
    @Test
    fun `environment label maps development`() {
        val viewModel = HomeViewModel(
            appConfig = AppConfig(
                environment = AppConfig.ENV_DEVELOPMENT,
                apiBaseUrl = "https://api-dev.example/",
            ),
        )

        assertEquals("Development", viewModel.environmentLabel)
        assertFalse(viewModel.apiBaseUrl.isBlank())
    }

    @Test
    fun `welcome message is stable for TDD baseline`() {
        val viewModel = HomeViewModel(
            appConfig = AppConfig(
                environment = AppConfig.ENV_PRODUCTION,
                apiBaseUrl = "https://api.example/",
            ),
        )

        assertEquals(
            "Build features with TDD — ship through dev → preprod → prod.",
            viewModel.welcomeMessage,
        )
    }
}
