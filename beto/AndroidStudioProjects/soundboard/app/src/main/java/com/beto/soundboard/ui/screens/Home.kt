package com.beto.soundboard.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.beto.soundboard.R

@Composable
fun HomeScreen(modifier: Modifier){
    Box(modifier = modifier){
    Row(modifier= Modifier
        .fillMaxWidth()
        .padding(top = 5.dp, start = 5.dp, end = 5.dp),
        horizontalArrangement = Arrangement.SpaceBetween) {

        SoundButton()
        SoundButton()
        SoundButton()
    }

    }
}

@Preview
@Composable
fun SoundButton(){

    Column(
        Modifier.clickable {  }
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

            AsyncImage(model = "https://t4.ftcdn.net/jpg/05/67/80/91/360_F_567809113_Vlhu0id4nej1xlP7wNreZKF8dPmANhgs.jpg", contentDescription = "sound logo", modifier = Modifier.fillMaxSize() )
//            Image(painter = painterResource(id = R.drawable.logo) , contentDescription = "SoundButton", modifier = Modifier.align(
//                Alignment.Center) )
        }
    }
}