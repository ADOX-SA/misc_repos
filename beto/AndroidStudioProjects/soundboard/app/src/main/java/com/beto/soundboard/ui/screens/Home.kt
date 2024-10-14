package com.beto.soundboard.ui.screens

import android.media.MediaPlayer
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.sharp.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
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
                SoundButton(
                    imageurl = "https://battlingblades.com/cdn/shop/products/DSC05982.jpg?v=1617661668&width=1080",
                    soundUrl = "https://www.sonidosmp3gratis.com/sounds/samurai-1.mp3"
                )
                SoundButton(
                    imageurl = "https://cdn.britannica.com/96/176196-050-EFC5E6A6/Glock-pistol.jpg",
                    soundUrl = "https://www.sonidosmp3gratis.com/sounds/9-mm-gunshot.mp3"
                )
                SoundButton(
                    imageurl = "https://lahora.gt/wp-content/uploads/sites/5/2016/06/Cul7_1-2-1.jpg",
                    soundUrl = "https://www.sonidosmp3gratis.com/sounds/grito-wilhelm.mp3"
                )

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
    imageurl: String = "https://t4.ftcdn.net/jpg/05/67/80/91/360_F_567809113_Vlhu0id4nej1xlP7wNreZKF8dPmANhgs.jpg",
    soundUrl: String = "https://www.sonidosmp3gratis.com/sounds/samurai-1.mp3",
    modifier: Modifier = Modifier,
    contentDescription: String? = null,
    name: String? = null,
){
    //download sound from this url
    // load in mediaplayer
    val context = LocalContext.current
    val mediaPlayer = MediaPlayer.create(
        context,
        Uri.parse(soundUrl)
    )

    Column(
        Modifier.clickable {
            mediaPlayer.start()
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
                model = imageurl,
                contentDescription = "sound logo",
                modifier = Modifier.fillMaxSize()
            )
//            Image(painter = painterResource(id = R.drawable.logo) , contentDescription = "SoundButton", modifier = Modifier.align(
//                Alignment.Center) )
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