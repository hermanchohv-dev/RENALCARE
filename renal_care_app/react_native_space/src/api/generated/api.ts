// @ts-nocheck
import {
  useMutation,
  useQuery
} from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query';

import type {
  AmbulanceStatusDto,
  ClinicalHistoryDto,
  ContactMessageResponseDto,
  ContactMessagesListDto,
  CreateContactMessageDto,
  DietRecommendationsDto,
  LoginDto,
  LoginResponseDto,
  MeResponseDto,
  PatientProfileDto,
  TreatmentInfoDto
} from './schemas';

import { customFetch } from '../customFetch';
import type { ErrorType , BodyType } from '../customFetch';


type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];



export const getAuthControllerLoginUrl = () => {




  return `/api/auth/login`
}

export const authControllerLogin = async (loginDto: LoginDto, options?: RequestInit): Promise<LoginResponseDto> => {

  return customFetch<LoginResponseDto>(getAuthControllerLoginUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(loginDto)
  }
);}




export const getAuthControllerLoginMutationOptions = <TError = ErrorType<unknown>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof authControllerLogin>>, TError,{data: BodyType<LoginDto>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof authControllerLogin>>, TError,{data: BodyType<LoginDto>}, TContext> => {

const mutationKey = ['authControllerLogin'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof authControllerLogin>>, {data: BodyType<LoginDto>}> = (props) => {
          const {data} = props ?? {};

          return  authControllerLogin(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type AuthControllerLoginMutationResult = NonNullable<Awaited<ReturnType<typeof authControllerLogin>>>
    export type AuthControllerLoginMutationBody = BodyType<LoginDto>
    export type AuthControllerLoginMutationError = ErrorType<unknown>

    export const useAuthControllerLogin = <TError = ErrorType<unknown>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof authControllerLogin>>, TError,{data: BodyType<LoginDto>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof authControllerLogin>>,
        TError,
        {data: BodyType<LoginDto>},
        TContext
      > => {
      return useMutation(getAuthControllerLoginMutationOptions(options), queryClient);
    }

export const getAuthControllerMeUrl = () => {




  return `/api/auth/me`
}

export const authControllerMe = async ( options?: RequestInit): Promise<MeResponseDto> => {

  return customFetch<MeResponseDto>(getAuthControllerMeUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getAuthControllerMeQueryKey = () => {
    return [
    `/api/auth/me`
    ] as const;
    }


export const getAuthControllerMeQueryOptions = <TData = Awaited<ReturnType<typeof authControllerMe>>, TError = ErrorType<unknown>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof authControllerMe>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getAuthControllerMeQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof authControllerMe>>> = ({ signal }) => authControllerMe({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof authControllerMe>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type AuthControllerMeQueryResult = NonNullable<Awaited<ReturnType<typeof authControllerMe>>>
export type AuthControllerMeQueryError = ErrorType<unknown>


export function useAuthControllerMe<TData = Awaited<ReturnType<typeof authControllerMe>>, TError = ErrorType<unknown>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof authControllerMe>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof authControllerMe>>,
          TError,
          Awaited<ReturnType<typeof authControllerMe>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useAuthControllerMe<TData = Awaited<ReturnType<typeof authControllerMe>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof authControllerMe>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof authControllerMe>>,
          TError,
          Awaited<ReturnType<typeof authControllerMe>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useAuthControllerMe<TData = Awaited<ReturnType<typeof authControllerMe>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof authControllerMe>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useAuthControllerMe<TData = Awaited<ReturnType<typeof authControllerMe>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof authControllerMe>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getAuthControllerMeQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getPatientsControllerGetProfileUrl = () => {




  return `/api/patients/me`
}

export const patientsControllerGetProfile = async ( options?: RequestInit): Promise<PatientProfileDto> => {

  return customFetch<PatientProfileDto>(getPatientsControllerGetProfileUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getPatientsControllerGetProfileQueryKey = () => {
    return [
    `/api/patients/me`
    ] as const;
    }


export const getPatientsControllerGetProfileQueryOptions = <TData = Awaited<ReturnType<typeof patientsControllerGetProfile>>, TError = ErrorType<unknown>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetProfile>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getPatientsControllerGetProfileQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof patientsControllerGetProfile>>> = ({ signal }) => patientsControllerGetProfile({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetProfile>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type PatientsControllerGetProfileQueryResult = NonNullable<Awaited<ReturnType<typeof patientsControllerGetProfile>>>
export type PatientsControllerGetProfileQueryError = ErrorType<unknown>


export function usePatientsControllerGetProfile<TData = Awaited<ReturnType<typeof patientsControllerGetProfile>>, TError = ErrorType<unknown>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetProfile>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof patientsControllerGetProfile>>,
          TError,
          Awaited<ReturnType<typeof patientsControllerGetProfile>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePatientsControllerGetProfile<TData = Awaited<ReturnType<typeof patientsControllerGetProfile>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetProfile>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof patientsControllerGetProfile>>,
          TError,
          Awaited<ReturnType<typeof patientsControllerGetProfile>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePatientsControllerGetProfile<TData = Awaited<ReturnType<typeof patientsControllerGetProfile>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetProfile>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function usePatientsControllerGetProfile<TData = Awaited<ReturnType<typeof patientsControllerGetProfile>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetProfile>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getPatientsControllerGetProfileQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getPatientsControllerGetClinicalHistoryUrl = () => {




  return `/api/patients/me/clinical-history`
}

export const patientsControllerGetClinicalHistory = async ( options?: RequestInit): Promise<ClinicalHistoryDto> => {

  return customFetch<ClinicalHistoryDto>(getPatientsControllerGetClinicalHistoryUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getPatientsControllerGetClinicalHistoryQueryKey = () => {
    return [
    `/api/patients/me/clinical-history`
    ] as const;
    }


export const getPatientsControllerGetClinicalHistoryQueryOptions = <TData = Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>, TError = ErrorType<unknown>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getPatientsControllerGetClinicalHistoryQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>> = ({ signal }) => patientsControllerGetClinicalHistory({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type PatientsControllerGetClinicalHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>>
export type PatientsControllerGetClinicalHistoryQueryError = ErrorType<unknown>


export function usePatientsControllerGetClinicalHistory<TData = Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>, TError = ErrorType<unknown>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>,
          TError,
          Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePatientsControllerGetClinicalHistory<TData = Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>,
          TError,
          Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePatientsControllerGetClinicalHistory<TData = Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function usePatientsControllerGetClinicalHistory<TData = Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetClinicalHistory>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getPatientsControllerGetClinicalHistoryQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getPatientsControllerGetTreatmentUrl = () => {




  return `/api/patients/me/treatment`
}

export const patientsControllerGetTreatment = async ( options?: RequestInit): Promise<TreatmentInfoDto> => {

  return customFetch<TreatmentInfoDto>(getPatientsControllerGetTreatmentUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getPatientsControllerGetTreatmentQueryKey = () => {
    return [
    `/api/patients/me/treatment`
    ] as const;
    }


export const getPatientsControllerGetTreatmentQueryOptions = <TData = Awaited<ReturnType<typeof patientsControllerGetTreatment>>, TError = ErrorType<unknown>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetTreatment>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getPatientsControllerGetTreatmentQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof patientsControllerGetTreatment>>> = ({ signal }) => patientsControllerGetTreatment({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetTreatment>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type PatientsControllerGetTreatmentQueryResult = NonNullable<Awaited<ReturnType<typeof patientsControllerGetTreatment>>>
export type PatientsControllerGetTreatmentQueryError = ErrorType<unknown>


export function usePatientsControllerGetTreatment<TData = Awaited<ReturnType<typeof patientsControllerGetTreatment>>, TError = ErrorType<unknown>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetTreatment>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof patientsControllerGetTreatment>>,
          TError,
          Awaited<ReturnType<typeof patientsControllerGetTreatment>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePatientsControllerGetTreatment<TData = Awaited<ReturnType<typeof patientsControllerGetTreatment>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetTreatment>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof patientsControllerGetTreatment>>,
          TError,
          Awaited<ReturnType<typeof patientsControllerGetTreatment>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePatientsControllerGetTreatment<TData = Awaited<ReturnType<typeof patientsControllerGetTreatment>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetTreatment>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function usePatientsControllerGetTreatment<TData = Awaited<ReturnType<typeof patientsControllerGetTreatment>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetTreatment>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getPatientsControllerGetTreatmentQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getPatientsControllerGetDietUrl = () => {




  return `/api/patients/me/diet`
}

export const patientsControllerGetDiet = async ( options?: RequestInit): Promise<DietRecommendationsDto> => {

  return customFetch<DietRecommendationsDto>(getPatientsControllerGetDietUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getPatientsControllerGetDietQueryKey = () => {
    return [
    `/api/patients/me/diet`
    ] as const;
    }


export const getPatientsControllerGetDietQueryOptions = <TData = Awaited<ReturnType<typeof patientsControllerGetDiet>>, TError = ErrorType<unknown>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetDiet>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getPatientsControllerGetDietQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof patientsControllerGetDiet>>> = ({ signal }) => patientsControllerGetDiet({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetDiet>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type PatientsControllerGetDietQueryResult = NonNullable<Awaited<ReturnType<typeof patientsControllerGetDiet>>>
export type PatientsControllerGetDietQueryError = ErrorType<unknown>


export function usePatientsControllerGetDiet<TData = Awaited<ReturnType<typeof patientsControllerGetDiet>>, TError = ErrorType<unknown>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetDiet>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof patientsControllerGetDiet>>,
          TError,
          Awaited<ReturnType<typeof patientsControllerGetDiet>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePatientsControllerGetDiet<TData = Awaited<ReturnType<typeof patientsControllerGetDiet>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetDiet>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof patientsControllerGetDiet>>,
          TError,
          Awaited<ReturnType<typeof patientsControllerGetDiet>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePatientsControllerGetDiet<TData = Awaited<ReturnType<typeof patientsControllerGetDiet>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetDiet>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function usePatientsControllerGetDiet<TData = Awaited<ReturnType<typeof patientsControllerGetDiet>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetDiet>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getPatientsControllerGetDietQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getPatientsControllerGetAmbulanceUrl = () => {




  return `/api/patients/me/ambulance`
}

export const patientsControllerGetAmbulance = async ( options?: RequestInit): Promise<AmbulanceStatusDto> => {

  return customFetch<AmbulanceStatusDto>(getPatientsControllerGetAmbulanceUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getPatientsControllerGetAmbulanceQueryKey = () => {
    return [
    `/api/patients/me/ambulance`
    ] as const;
    }


export const getPatientsControllerGetAmbulanceQueryOptions = <TData = Awaited<ReturnType<typeof patientsControllerGetAmbulance>>, TError = ErrorType<unknown>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetAmbulance>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getPatientsControllerGetAmbulanceQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof patientsControllerGetAmbulance>>> = ({ signal }) => patientsControllerGetAmbulance({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetAmbulance>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type PatientsControllerGetAmbulanceQueryResult = NonNullable<Awaited<ReturnType<typeof patientsControllerGetAmbulance>>>
export type PatientsControllerGetAmbulanceQueryError = ErrorType<unknown>


export function usePatientsControllerGetAmbulance<TData = Awaited<ReturnType<typeof patientsControllerGetAmbulance>>, TError = ErrorType<unknown>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetAmbulance>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof patientsControllerGetAmbulance>>,
          TError,
          Awaited<ReturnType<typeof patientsControllerGetAmbulance>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePatientsControllerGetAmbulance<TData = Awaited<ReturnType<typeof patientsControllerGetAmbulance>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetAmbulance>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof patientsControllerGetAmbulance>>,
          TError,
          Awaited<ReturnType<typeof patientsControllerGetAmbulance>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function usePatientsControllerGetAmbulance<TData = Awaited<ReturnType<typeof patientsControllerGetAmbulance>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetAmbulance>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function usePatientsControllerGetAmbulance<TData = Awaited<ReturnType<typeof patientsControllerGetAmbulance>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof patientsControllerGetAmbulance>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getPatientsControllerGetAmbulanceQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getContactControllerCreateUrl = () => {




  return `/api/contact-messages`
}

export const contactControllerCreate = async (createContactMessageDto: CreateContactMessageDto, options?: RequestInit): Promise<ContactMessageResponseDto> => {

  return customFetch<ContactMessageResponseDto>(getContactControllerCreateUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(createContactMessageDto)
  }
);}




export const getContactControllerCreateMutationOptions = <TError = ErrorType<unknown>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof contactControllerCreate>>, TError,{data: BodyType<CreateContactMessageDto>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof contactControllerCreate>>, TError,{data: BodyType<CreateContactMessageDto>}, TContext> => {

const mutationKey = ['contactControllerCreate'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof contactControllerCreate>>, {data: BodyType<CreateContactMessageDto>}> = (props) => {
          const {data} = props ?? {};

          return  contactControllerCreate(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type ContactControllerCreateMutationResult = NonNullable<Awaited<ReturnType<typeof contactControllerCreate>>>
    export type ContactControllerCreateMutationBody = BodyType<CreateContactMessageDto>
    export type ContactControllerCreateMutationError = ErrorType<unknown>

    export const useContactControllerCreate = <TError = ErrorType<unknown>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof contactControllerCreate>>, TError,{data: BodyType<CreateContactMessageDto>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof contactControllerCreate>>,
        TError,
        {data: BodyType<CreateContactMessageDto>},
        TContext
      > => {
      return useMutation(getContactControllerCreateMutationOptions(options), queryClient);
    }

export const getContactControllerListUrl = () => {




  return `/api/contact-messages`
}

export const contactControllerList = async ( options?: RequestInit): Promise<ContactMessagesListDto> => {

  return customFetch<ContactMessagesListDto>(getContactControllerListUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getContactControllerListQueryKey = () => {
    return [
    `/api/contact-messages`
    ] as const;
    }


export const getContactControllerListQueryOptions = <TData = Awaited<ReturnType<typeof contactControllerList>>, TError = ErrorType<unknown>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof contactControllerList>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getContactControllerListQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof contactControllerList>>> = ({ signal }) => contactControllerList({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof contactControllerList>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ContactControllerListQueryResult = NonNullable<Awaited<ReturnType<typeof contactControllerList>>>
export type ContactControllerListQueryError = ErrorType<unknown>


export function useContactControllerList<TData = Awaited<ReturnType<typeof contactControllerList>>, TError = ErrorType<unknown>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof contactControllerList>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof contactControllerList>>,
          TError,
          Awaited<ReturnType<typeof contactControllerList>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useContactControllerList<TData = Awaited<ReturnType<typeof contactControllerList>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof contactControllerList>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof contactControllerList>>,
          TError,
          Awaited<ReturnType<typeof contactControllerList>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useContactControllerList<TData = Awaited<ReturnType<typeof contactControllerList>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof contactControllerList>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useContactControllerList<TData = Awaited<ReturnType<typeof contactControllerList>>, TError = ErrorType<unknown>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof contactControllerList>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getContactControllerListQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







