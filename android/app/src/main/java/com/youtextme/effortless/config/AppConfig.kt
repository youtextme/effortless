package com.youtextme.effortless.config

import com.youtextme.effortless.BuildConfig

data class AppConfig(
    val environment: String,
    val apiBaseUrl: String,
) {
    val isProduction: Boolean
        get() = environment == ENV_PRODUCTION

    companion object {
        const val ENV_PRODUCTION = "production"
        const val ENV_PREPRODUCTION = "preproduction"
        const val ENV_DEVELOPMENT = "development"

        fun fromBuildConfig(): AppConfig = AppConfig(
            environment = BuildConfig.ENVIRONMENT,
            apiBaseUrl = BuildConfig.API_BASE_URL,
        )
    }
}
