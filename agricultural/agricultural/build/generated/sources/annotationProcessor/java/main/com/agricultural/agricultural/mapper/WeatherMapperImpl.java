package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.domain.entity.AgriculturalAdvice;
import com.agricultural.agricultural.domain.entity.WeatherData;
import com.agricultural.agricultural.dto.AgriculturalAdviceDTO;
import com.agricultural.agricultural.dto.WeatherDTO;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-03-29T01:21:31+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23 (Oracle Corporation)"
)
@Component
public class WeatherMapperImpl implements WeatherMapper {

    @Override
    public WeatherData toEntity(WeatherDTO dto) {
        if ( dto == null ) {
            return null;
        }

        WeatherData.WeatherDataBuilder weatherData = WeatherData.builder();

        weatherData.weatherDescription( listToString( dto.getWeatherDescriptions() ) );
        weatherData.dataTime( unixTimeToLocalDateTime( dto.getTimestamp() ) );
        weatherData.lat( dto.getLatitude() );
        weatherData.lon( dto.getLongitude() );
        weatherData.city( dto.getCity() );
        weatherData.country( dto.getCountry() );
        weatherData.temperature( dto.getTemperature() );
        weatherData.humidity( dto.getHumidity() );
        weatherData.windSpeed( dto.getWindSpeed() );
        weatherData.windDeg( dto.getWindDeg() );
        weatherData.feelsLike( dto.getFeelsLike() );
        weatherData.minTemp( dto.getMinTemp() );
        weatherData.maxTemp( dto.getMaxTemp() );
        weatherData.iconCode( dto.getIconCode() );
        weatherData.sunrise( dto.getSunrise() );
        weatherData.sunset( dto.getSunset() );

        weatherData.requestTime( java.time.LocalDateTime.now() );

        return weatherData.build();
    }

    @Override
    public WeatherDTO toDTO(WeatherData entity) {
        if ( entity == null ) {
            return null;
        }

        WeatherDTO.WeatherDTOBuilder weatherDTO = WeatherDTO.builder();

        weatherDTO.weatherDescriptions( stringToList( entity.getWeatherDescription() ) );
        weatherDTO.timestamp( localDateTimeToUnixTime( entity.getDataTime() ) );
        weatherDTO.latitude( entity.getLat() );
        weatherDTO.longitude( entity.getLon() );
        weatherDTO.city( entity.getCity() );
        weatherDTO.country( entity.getCountry() );
        weatherDTO.temperature( entity.getTemperature() );
        weatherDTO.feelsLike( entity.getFeelsLike() );
        weatherDTO.minTemp( entity.getMinTemp() );
        weatherDTO.maxTemp( entity.getMaxTemp() );
        weatherDTO.humidity( entity.getHumidity() );
        weatherDTO.windSpeed( entity.getWindSpeed() );
        weatherDTO.windDeg( entity.getWindDeg() );
        weatherDTO.iconCode( entity.getIconCode() );
        weatherDTO.sunrise( entity.getSunrise() );
        weatherDTO.sunset( entity.getSunset() );

        return weatherDTO.build();
    }

    @Override
    public List<WeatherDTO> toDTOList(List<WeatherData> entities) {
        if ( entities == null ) {
            return null;
        }

        List<WeatherDTO> list = new ArrayList<WeatherDTO>( entities.size() );
        for ( WeatherData weatherData : entities ) {
            list.add( toDTO( weatherData ) );
        }

        return list;
    }

    @Override
    public List<WeatherData> toEntityList(List<WeatherDTO> dtos) {
        if ( dtos == null ) {
            return null;
        }

        List<WeatherData> list = new ArrayList<WeatherData>( dtos.size() );
        for ( WeatherDTO weatherDTO : dtos ) {
            list.add( toEntity( weatherDTO ) );
        }

        return list;
    }

    @Override
    public AgriculturalAdviceDTO toDTO(AgriculturalAdvice entity) {
        if ( entity == null ) {
            return null;
        }

        AgriculturalAdviceDTO.AgriculturalAdviceDTOBuilder agriculturalAdviceDTO = AgriculturalAdviceDTO.builder();

        agriculturalAdviceDTO.weatherSummary( entity.getWeatherSummary() );
        agriculturalAdviceDTO.farmingAdvice( stringToList( entity.getFarmingAdvice() ) );
        agriculturalAdviceDTO.cropAdvice( stringToList( entity.getCropAdvice() ) );
        agriculturalAdviceDTO.warnings( stringToList( entity.getWarnings() ) );
        agriculturalAdviceDTO.isRainySeason( entity.getIsRainySeason() );
        agriculturalAdviceDTO.isDrySeason( entity.getIsDrySeason() );
        agriculturalAdviceDTO.isSuitableForPlanting( entity.getIsSuitableForPlanting() );
        agriculturalAdviceDTO.isSuitableForHarvesting( entity.getIsSuitableForHarvesting() );
        agriculturalAdviceDTO.recommendedActivities( entity.getRecommendedActivities() );

        return agriculturalAdviceDTO.build();
    }

    @Override
    public AgriculturalAdvice toEntity(AgriculturalAdviceDTO dto) {
        if ( dto == null ) {
            return null;
        }

        AgriculturalAdvice.AgriculturalAdviceBuilder agriculturalAdvice = AgriculturalAdvice.builder();

        agriculturalAdvice.weatherSummary( dto.getWeatherSummary() );
        agriculturalAdvice.farmingAdvice( listToString( dto.getFarmingAdvice() ) );
        agriculturalAdvice.cropAdvice( listToString( dto.getCropAdvice() ) );
        agriculturalAdvice.warnings( listToString( dto.getWarnings() ) );
        agriculturalAdvice.isRainySeason( dto.getIsRainySeason() );
        agriculturalAdvice.isDrySeason( dto.getIsDrySeason() );
        agriculturalAdvice.isSuitableForPlanting( dto.getIsSuitableForPlanting() );
        agriculturalAdvice.isSuitableForHarvesting( dto.getIsSuitableForHarvesting() );
        agriculturalAdvice.recommendedActivities( dto.getRecommendedActivities() );

        agriculturalAdvice.createdAt( java.time.LocalDateTime.now() );

        return agriculturalAdvice.build();
    }
}
