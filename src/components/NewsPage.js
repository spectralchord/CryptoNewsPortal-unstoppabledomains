import React, {useEffect, useState} from 'react';
import {
    Box,
    Center,
    Flex,
    Heading,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalOverlay,
    SimpleGrid,
    Spinner,
    Text,
    Tooltip,
    useColorModeValue,
    useDisclosure
} from "@chakra-ui/react";
import {useParams} from "react-router-dom";
import {useStore} from "../contexts/AuthContext";
import {Contract, ethers} from "ethers";
import {ABI, CONTRACT, IPFS_GET_LINK, POLYGON_RPC} from "../utils/Constants";
import axios from "axios";

function NewsPage() {
    let {id} = useParams()
    const {isOpen, onOpen, onClose} = useDisclosure()

    const {
        content,
        setContent,
        web3Connect,
        chainId,
        address
    } = useStore()

    const [currentModalImage, setCurrentModalImage] = useState('')
    const [loading, setLoading] = useState(true)

    const handlerFetchNews = async (id) => {
        setLoading(true)
        const ethersProvider = new ethers.providers.JsonRpcProvider(POLYGON_RPC);
        const myContract = new Contract(CONTRACT, ABI, ethersProvider);
        const totalCount = await myContract.getCount()
        if (parseInt(id) > totalCount || parseInt(id) <= 0) {
            setContent(null)
        } else {
            let response = await myContract.getNewsByPosition(id)
            const link = response[0]
            if (link) {
                let object = await axios.get(IPFS_GET_LINK + link)
                object.data.author = response[1];
                object.data.timestampMs = response[2];
                object.data.timestamp = new Date(response[2] * 1000)
                    .toISOString()
                    .slice(0, 16)
                    .replace('T', ' ')
                setContent(object)
            }
        }
        setLoading(false)
    }

    const init = async () => {
        await handlerFetchNews(id)
    }

    useEffect(() => {
        init()
    }, [])

    const handlerOpenModal = (image) => {
        onOpen()
        setCurrentModalImage(image)
    }


    return (
        <Flex color={useColorModeValue('gray.600', 'gray.400')}
              rounded={'8px'} w={[450, 650, 850]}
              flexDirection={'column'}
              height="full">
            {
                loading
                    ? (<center><Spinner
                        alignItems={"center"}
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        color='blue.500'
                        size='xl'
                    />
                    </center>)
                    : content
                        ? <>
                            <Box>
                                <Heading mb={'15px'}
                                         textAlign={'center'}
                                         textTransform={'uppercase'}>
                                    {content?.data && content.data.title}
                                </Heading>
                                <Flex mb={'25px'}
                                      bg={'#4848483d'}
                                      rounded={'10px'}
                                      direction={'column'}
                                      justifyContent={'space-between'} p={'20px'}>
                                    {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                                    <Flex color={useColorModeValue('gray.800', 'gray.300')}
                                          justifyContent={'space-between'}
                                          flexWrap={'wrap'}
                                          gap={'10px'}
                                          mb={'15px'}>
                                        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                                        <Text bg={useColorModeValue('gray.100', 'gray.700')}
                                              rounded={'25px'}
                                              pl={'10px'}
                                              pr={'10px'}>
                                            <Tooltip maxW={'100%'}
                                                     fontSize={'15px'}
                                                     label={content?.data.author}>
                                                <Flex>
                                                    <Text>
                                                        <b>Create by: </b>
                                                        {
                                                            content?.data.author.substr(0, 6)
                                                            + "..."
                                                            + content?.data.author.substr(content?.data.author.length - 10)
                                                        }
                                                    </Text>
                                                    {content?.data?.domainName &&
                                                        <Text className="domain-name">
                                                            &nbsp;[<u>{content?.data?.domainName}</u>]
                                                        </Text>
                                                    }
                                                </Flex>
                                            </Tooltip>
                                        </Text>
                                        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                                        <Text bg={useColorModeValue('gray.100', 'gray.700')}
                                              rounded={'25px'}
                                              pl={'10px'}
                                              pr={'10px'}>
                                            <b>Date:</b> {content?.data.timestamp}
                                        </Text>
                                    </Flex>
                                    <Text whiteSpace={'pre-wrap'}>
                                        {content?.data && content.data.body}
                                    </Text>
                                </Flex>
                            </Box>
                            {content?.data.images.length !== 0 &&
                                <SimpleGrid p={5}
                                            w={'full'}
                                            rounded={'5px'}
                                            spacing={'20px'}
                                            color={'gray.400'}
                                            overflow={'hidden'}
                                            alignItems={'center'}
                                            justifyItems={'center'}
                                            columns={content?.data.images.length === 1 ? [1] : [1, 2, 3]}>
                                    {content?.data.images.map((image, index) =>
                                        <Image p={0}
                                               src={IPFS_GET_LINK + image}
                                               rounded={'10px'}
                                               cursor={'pointer'}
                                               key={image + '_' + index}
                                               onClick={() => handlerOpenModal(image)} w={'250px'}/>)
                                    }
                                </SimpleGrid>
                            }
                            <Modal p={0}
                                   isCentered
                                   isOpen={isOpen}
                                   onClose={onClose}>
                                <ModalOverlay/>
                                <ModalContent p={0} maxW="70vw" maxH="80vh">
                                    <ModalCloseButton  color="teal"/>
                                    <ModalBody className="modal-body" p={0}>
                                        <Image className="img-style2" src={IPFS_GET_LINK +
                                            currentModalImage}/>
                                    </ModalBody>
                                </ModalContent>
                            </Modal>
                        </>
                        : <Center fontWeight={'bold'} fontSize={'25px'}>This news does not exist</Center>
            }
        </Flex>
    );
}

export default NewsPage;
