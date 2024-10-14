package com.beto.soundboard.service

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {
    @GET("posts")
    suspend fun getSounds(): Any
}

object RetrofitInstance {
    private
    const val BASE_URL = "https://jsonplaceholder.typicode.com/"
    val api: ApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(
                GsonConverterFactory
                .create())
            .build()
        retrofit.create(ApiService::class.java)
    }
}