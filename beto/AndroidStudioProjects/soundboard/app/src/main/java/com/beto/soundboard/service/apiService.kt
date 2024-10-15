package com.beto.soundboard.service

import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.GET

interface ApiService {
    @GET("posts")
    suspend fun getSounds(): Any
}

private object ApiDropbox {
    private const val BASE_URL = "https://jsonplaceholder.typicode.com/"
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(MoshiConverterFactory.create()).client(OkHttpClient.Builder().build())
        .build().create(ApiService::class.java)

    suspend fun getSounds() = retrofit.getSounds()
}