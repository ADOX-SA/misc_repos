package com.beto.soundboard.ui.components

import android.util.Log
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.beto.soundboard.R


@OptIn(ExperimentalMaterial3Api::class)

@Composable
fun TopBar() {

    Column {
        TopAppBar(
            title = { Text(text = "exermos", style = MaterialTheme.typography.titleLarge) },
            navigationIcon = {
                IconButton(onClick = {
                    /* ACA DEBE IR LA ACCION DEL BOTON MENU */
                    Log.d("TAG", "TopBar: Boton Menu")
                    /* scaffoldState
                     .drawerState.open()*/
                }) {
                    Icon(
                        imageVector = Icons.Filled.Menu,
                        contentDescription = "Open/Close Bottom Sheet"
                    )
                }
            },
            actions = {
                DnDLogo()
            }
        )
        Row(modifier = Modifier.padding(5.dp,0.dp)) {

            Divider(
                color = MaterialTheme.colorScheme.outline
            )
        }
    }
}

@Preview
@Composable
fun TopBarPreview() {
        TopBar()

}

@Composable
fun DnDLogo(){
    Image(
        painter = painterResource(id = R.drawable.logo),
        contentDescription = "DnDLogo",
        modifier = Modifier.size(60.dp),
    )
}
