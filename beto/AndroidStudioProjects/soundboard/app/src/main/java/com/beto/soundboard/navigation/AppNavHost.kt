package com.beto.soundboard.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.beto.soundboard.ui.screens.LoginScreen
import com.beto.soundboard.ui.screens.SplashIntroScreen


enum class Screen {
    SOUNDS_SCREEN,
    LOGIN,
    AMBIENT_SCREEN,
    SPLASH_INTRO
}



sealed class NavigationItem(val route: String) {
    data object SoundsScreen : NavigationItem(Screen.SOUNDS_SCREEN.name)
    data object AmbientScreen : NavigationItem(Screen.AMBIENT_SCREEN.name)
    data object Login: NavigationItem(Screen.LOGIN.name)
    data object SplashIntroScreen : NavigationItem(Screen.SPLASH_INTRO.name)
}

@Composable
fun AppNavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController,
    startDestination: String = NavigationItem.SplashIntroScreen.route,
) {
    NavHost(
        modifier = modifier,
        navController = navController,
        startDestination = startDestination
    ) {
        composable(NavigationItem.SplashIntroScreen.route) {
            SplashIntroScreen(navController)
        }
        composable(NavigationItem.Login.route) {
            LoginScreen(navController)
        }
    }
}