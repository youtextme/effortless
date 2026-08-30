package com.youtextme.effortless

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.youtextme.effortless.ui.EffortlessApp
import com.youtextme.effortless.ui.theme.EffortlessTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            EffortlessTheme {
                EffortlessApp()
            }
        }
    }
}
