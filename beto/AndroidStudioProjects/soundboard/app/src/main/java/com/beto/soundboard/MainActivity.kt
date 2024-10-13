package com.beto.soundboard

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import com.beto.soundboard.ui.components.TopBar
import com.beto.soundboard.ui.screens.HomeScreen
import com.beto.soundboard.ui.theme.SoundboardTheme


class MainActivity : ComponentActivity() {
    @SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SoundboardTheme {
                Scaffold(modifier = Modifier.safeDrawingPadding().background(MaterialTheme.colorScheme.background),
                    topBar = { TopBar() },
                    content = { it ->

                        HomeScreen(modifier = Modifier.padding(it))
                    }
                )
            }
            }
        }
    }

