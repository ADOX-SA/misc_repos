package com.beto.soundboard

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.compose.rememberNavController
import com.beto.soundboard.navigation.AppNavHost
import com.beto.soundboard.ui.components.TopBar
import com.beto.soundboard.ui.screens.HomeScreen
import com.beto.soundboard.ui.theme.SoundboardTheme
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException

class MainActivity : ComponentActivity() {

    @OptIn(ExperimentalLayoutApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SoundboardTheme {
                Scaffold(modifier = Modifier.safeDrawingPadding().background(MaterialTheme.colorScheme.background),
                    topBar = { TopBar() },
                    content = { it ->
                        AppNavHost(modifier = Modifier.padding(it), navController = rememberNavController()
                        )
                    },
                    floatingActionButton = {
                        FloatingPlayButton(
                            onClick = {
                                Log.d("TAG", "onCreate: FloatingPlayButton")
                            }
                        )
                    },
                    bottomBar = {

                    }
                )
            }
        }
    }
}

@Composable
fun FloatingPlayButton(onClick: () -> Unit) {
    FloatingActionButton(
        onClick = { onClick() },
    ) {
        Icon(Icons.Filled.PlayArrow, "Floating action button.")
    }
}

