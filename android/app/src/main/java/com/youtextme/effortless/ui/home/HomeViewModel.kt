package com.youtextme.effortless.ui.home

import com.youtextme.effortless.config.AppConfig

class HomeViewModel(
    private val appConfig: AppConfig = AppConfig.fromBuildConfig(),
) {
    val environmentLabel: String
        get() = when (appConfig.environment) {
            AppConfig.ENV_DEVELOPMENT -> "Development"
            AppConfig.ENV_PREPRODUCTION -> "Pre-Production"
            AppConfig.ENV_PRODUCTION -> "Production"
            else -> appConfig.environment.replaceFirstChar { it.uppercase() }
        }

    val apiBaseUrl: String
        get() = appConfig.apiBaseUrl

    val welcomeMessage: String
        get() = "Build features with TDD — ship through dev → preprod → prod."
}
