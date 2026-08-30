package com.youtextme.effortless.ui.home

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import androidx.test.ext.junit.runners.AndroidJUnit4

@RunWith(AndroidJUnit4::class)
class HomeScreenTest {
    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun homeScreen_showsEnvironmentAndMessage() {
        val viewModel = HomeViewModel(
            appConfig = com.youtextme.effortless.config.AppConfig(
                environment = com.youtextme.effortless.config.AppConfig.ENV_DEVELOPMENT,
                apiBaseUrl = "https://api-dev.effortless.app/",
            ),
        )

        composeRule.setContent {
            HomeScreen(viewModel = viewModel)
        }

        composeRule.onNodeWithTag("home_title").assertIsDisplayed()
        composeRule.onNodeWithTag("home_message").assertIsDisplayed()
        composeRule.onNodeWithTag("home_environment").assertIsDisplayed()
    }
}
