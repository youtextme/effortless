package com.youtextme.effortless.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.youtextme.effortless.ui.home.HomeScreen
import com.youtextme.effortless.ui.home.HomeViewModel

@Composable
fun EffortlessApp(
    homeViewModel: HomeViewModel = HomeViewModel(),
) {
    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        HomeScreen(
            viewModel = homeViewModel,
            modifier = Modifier.padding(innerPadding),
        )
    }
}
