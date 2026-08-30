package com.youtextme.effortless.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background,
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = "Effortless",
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.testTag("home_title"),
            )
            Text(
                text = viewModel.welcomeMessage,
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.testTag("home_message"),
            )
            Text(
                text = "Environment: ${viewModel.environmentLabel}",
                style = MaterialTheme.typography.labelLarge,
                modifier = Modifier.testTag("home_environment"),
            )
            Text(
                text = "API: ${viewModel.apiBaseUrl}",
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.testTag("home_api"),
            )
        }
    }
}
