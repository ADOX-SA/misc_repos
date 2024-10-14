package com.beto.soundboard.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun TitleItem(title: String){
    Row {
        Box(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.primary)
                .width(3.dp)
                .height(
                    MaterialTheme.typography.headlineMedium.fontSize.value.dp
                )
                .align(Alignment.CenterVertically)
        )
        Spacer(modifier = Modifier.width(5.dp))

        Text(text = title,
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.headlineMedium
        )
    }
}

@Preview
@Composable
fun TitleItemPreview(){
    TitleItem(title = "Title")
}
