import React, {useEffect, useState} from 'react';
import NewsCard from "./NewsCard";
import {Box, Center, Flex, SimpleGrid, Spinner} from "@chakra-ui/react";
import {useStore} from "../contexts/AuthContext";
import {handlerFetchNews} from "../utils/handlers";
import {Contract, ethers} from "ethers";
import {ABI, POLYGON_RPC, CONTRACT, IPFS_GET_LINK} from "../utils/Constants";
import axios from "axios";

function AllNewsPage() {
    const {content, setContent, web3Connect, chainId, address} = useStore()
    const [loading, setLoading] = useState(true)

    const handlerFetchNews = async () => {
        setLoading(true)
        const array = [];
        const ethersProvider = new ethers.providers.JsonRpcProvider(POLYGON_RPC);
        const myContract = new Contract(CONTRACT, ABI, ethersProvider);
        const totalCount = await myContract.getCount()
        let j = 1;
        for (let i = totalCount; i >= 1; --i) {
            let response = await myContract.getNewsByPosition(i)
            const link = response[0]
            if (link) {
                let object = await axios.get(IPFS_GET_LINK + link)
                object.data.id = parseInt(j);
                object.data.author = response[1];
                object.data.position = parseInt(i);
                object.data.timestampMs = response[2];
                object.data.timestamp = new Date(response[2] * 1000)
                    .toISOString()
                    .slice(0, 16)
                    .replace('T', ' ')
                j = j + 1
                array.push(object)
            }
            setContent([...array])
        }
        setLoading(false)
    }

    const init = async () => {
        await handlerFetchNews()
    }

    useEffect(() => {
        init()
    }, [web3Connect, chainId])

    // if (content.length == 0) {
    //     // return  <Center fontWeight={'bold'} fontSize={'25px'}>NO NEWS</Center>
    //
    //     return <Spinner
    //         thickness='4px'
    //         speed='0.65s'
    //         emptyColor='gray.200'
    //         color='blue.500'
    //         size='xl'
    //     />
    // }

    return (<Flex height="full" alignItems={'center'} flexDirection={'column'}>
        {loading
            ? <Spinner
                thickness='4px'
                speed='0.65s'
                emptyColor='gray.200'
                color='blue.500'
                size='xl'
            />
            : <>
                {(content.length > 0)
                    ? <>
                        <i className="fas fa-sync-alt" style={{cursor: 'pointer'}} onClick={() => init()}/>
                        <SimpleGrid mr={'40px'} rowGap={'0px'} columnGap={'60px'} columns={[1, 1, 2, 3, 4]}>
                            {content && content.map((item, index) => <Box w='110%' key={item.data.title + '_' + index}>
                                <NewsCard id={item.data?.position}
                                          domainName={item.data?.domainName}
                                          position={item.data?.position}
                                          body={item.data?.body}
                                          title={item.data?.title}
                                          author={item.data.author}
                                          timestamp={item.data.timestamp}
                                          imageSrc={item.data?.images && item.data?.images[0]}
                                />
                            </Box>)}
                        </SimpleGrid>
                    </>
                    : <Center fontWeight={'bold'} fontSize={'25px'}>NO NEWS</Center>
                }
            </> }

    </Flex>)
}

export default AllNewsPage;
