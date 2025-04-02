package com.agricultural.agricultural.mapper;

import com.agricultural.agricultural.domain.entity.Share;
import com.agricultural.agricultural.dto.ShareDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-01T16:21:07+0700",
    comments = "version: 1.5.5.Final, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.12.1.jar, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class ShareMapperImpl implements ShareMapper {

    @Override
    public ShareDTO toDto(Share share) {
        if ( share == null ) {
            return null;
        }

        ShareDTO shareDTO = new ShareDTO();

        shareDTO.setId( share.getId() );
        shareDTO.setShareDate( share.getShareDate() );

        return shareDTO;
    }

    @Override
    public Share toEntity(ShareDTO shareDTO) {
        if ( shareDTO == null ) {
            return null;
        }

        Share.ShareBuilder share = Share.builder();

        share.id( shareDTO.getId() );
        share.shareDate( shareDTO.getShareDate() );

        return share.build();
    }
}
