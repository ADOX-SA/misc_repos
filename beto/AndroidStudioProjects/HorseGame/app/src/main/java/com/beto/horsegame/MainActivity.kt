package com.beto.horsegame

import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TableLayout
import android.widget.TableRow
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.tooling.preview.Preview
import com.beto.horsegame.R.color.white_cell
import com.beto.horsegame.ui.theme.HorseGameTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initScreenGame()
    }
    private fun initScreenGame() {
        hide_message()
        setSizeBoard()

    }
    private fun setSizeBoard(){
        var table = findViewById<TableLayout>(R.id.mTable)
//        agregar celdas al tablero
        for (i in 0..7){
            val row = TableRow(this)
            row.weightSum = 8F
            for (j in 0..7){
                val cell = ImageView(this)
                cell.tag = "$i$j"
//                cell.setImageResource(R.drawable.horse)
                cell.setBackgroundColor(getColor(0xAAffaa ))
                cell.scaleType = ImageView.ScaleType.FIT_XY
                cell.layoutParams = TableRow.LayoutParams(0, 0, 1F)
                row.addView(cell)
                table.addView(row)
            }
        }
    }
    private fun hide_message(){
        var lyMessage = findViewById<LinearLayout>(R.id.lyMessage);
            lyMessage.visibility = View.INVISIBLE;
        }
}

