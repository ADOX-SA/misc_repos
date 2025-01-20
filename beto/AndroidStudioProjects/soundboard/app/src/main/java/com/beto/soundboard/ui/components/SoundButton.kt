package com.beto.soundboard.ui.components

import android.media.MediaPlayer
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage

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