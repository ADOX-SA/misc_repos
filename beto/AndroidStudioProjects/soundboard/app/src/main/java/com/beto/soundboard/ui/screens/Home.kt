package com.beto.soundboard.ui.screens

import android.annotation.SuppressLint
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.sharp.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.beto.soundboard.ui.components.TitleItem

@ExperimentalLayoutApi
@Composable
fun HomeScreen(modifier: Modifier){
    Box(modifier = modifier){
        Column(modifier = Modifier.fillMaxWidth()) {
            TitleItem(title = "Ambientales")
            Column {
                AmbientButton()
            }
            TitleItem(title = "Sonidos")
            FlowRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 5.dp, start = 5.dp, end = 5.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                SoundButton()
                SoundButton()
                SoundButton()
                SoundButton()
                SoundButton()
                SoundButton()
                SoundButton()
            }
        }

    }
}

@OptIn(ExperimentalLayoutApi::class)
@Preview
@Composable
fun HomeScreenPreview(){
    HomeScreen(modifier = Modifier.fillMaxSize())
}

@Preview
@Composable
fun SoundButton(
    url: String = "https://t4.ftcdn.net/jpg/05/67/80/91/360_F_567809113_Vlhu0id4nej1xlP7wNreZKF8dPmANhgs.jpg",
    modifier: Modifier = Modifier,
    contentDescription: String? = null,
    name: String? = null,
){
    var visible by remember {
        mutableStateOf(true)
    }
    // cargar el sonido desde la api de google drive
    AnimatedVisibility(visible) {


    Column(
        Modifier.clickable {

        }
    ) {
        Text(text = "SoundButton", style = MaterialTheme.typography.labelSmall, fontSize = 10.sp, color = MaterialTheme.colorScheme.secondary)
        Box(modifier = Modifier
            .size(105.dp)
            .background(MaterialTheme.colorScheme.primaryContainer)
            .border(
                width = 0.5.dp,
                color = MaterialTheme.colorScheme.primary,
                shape = MaterialTheme.shapes.extraSmall
            )
            .padding(1.dp)
        )
        {

            AsyncImage(
                model = "https://t4.ftcdn.net/jpg/05/67/80/91/360_F_567809113_Vlhu0id4nej1xlP7wNreZKF8dPmANhgs.jpg",
                contentDescription = "sound logo",
                modifier = Modifier.fillMaxSize()
            )
//            Image(painter = painterResource(id = R.drawable.logo) , contentDescription = "SoundButton", modifier = Modifier.align(
//                Alignment.Center) )
        }
    }

    }
}

@Composable
fun AmbientButton(){
    Box(modifier = Modifier
        .fillMaxWidth()
        .height(30.dp)
        .background(MaterialTheme.colorScheme.primaryContainer)
        .border(
            color = MaterialTheme.colorScheme.outline,
            width = 1.dp,
            shape = MaterialTheme.shapes.extraSmall
        )
        .padding(5.dp, 0.dp)
        ){
        Icon(
            imageVector = Icons.Sharp.PlayArrow,
            contentDescription = "Open/Close Bottom Sheet",
            modifier = Modifier.align(androidx.compose.ui.Alignment.CenterStart),
            tint = MaterialTheme.colorScheme.primary,
        )
        Text(
            modifier = Modifier.align(androidx.compose.ui.Alignment.Center),
            text = "Ambientales",
            style = MaterialTheme.typography.labelSmall,
            fontSize = 10.sp,
            color = MaterialTheme.colorScheme.secondary,

            )

    }
}