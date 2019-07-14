//
// $Id$
//

//
// Sphinx UDF function example
//
// Linux
// gcc -fPIC -shared -o udfexample.so udfexample.c
// CREATE FUNCTION sequence RETURNS INT SONAME 'udfexample.so';
// CREATE FUNCTION strtoint RETURNS INT SONAME 'udfexample.so';
// CREATE FUNCTION avgmva RETURNS FLOAT SONAME 'udfexample.so';
// CREATE FUNCTION failtest RETURNS STRING SONAME 'udfexample.so';
//
// Windows
// cl /MTd /LD udfexample.c
// CREATE FUNCTION sequence RETURNS INT SONAME 'udfexample.dll';
// CREATE FUNCTION strtoint RETURNS INT SONAME 'udfexample.dll';
// CREATE FUNCTION avgmva RETURNS FLOAT SONAME 'udfexample.dll';
// CREATE FUNCTION failtest RETURNS STRING SONAME 'udfexample.dll';
//

#include "sphinxudf.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#ifdef _MSC_VER
#define snprintf _snprintf
#define DLLEXPORT __declspec(dllexport)
#else
#define DLLEXPORT
#endif

/// UDF version control
/// gets called once when the library is loaded
DLLEXPORT int udfexample_ver ()
{
	return SPH_UDF_VERSION;
}


/// UDF re-initialization func
/// gets called on sighup (workers=prefork only)
DLLEXPORT void udfexample_reinit ()
{
}


/// UDF initialization
/// gets called on every query, when query begins
/// args are filled with values for a particular query
DLLEXPORT int sequence_init ( SPH_UDF_INIT * init, SPH_UDF_ARGS * args, char * error_message )
{
	// check argument count
	if ( args->arg_count > 1 )
	{
		snprintf ( error_message, SPH_UDF_ERROR_LEN, "SEQUENCE() takes either 0 or 1 arguments" );
		return 1;
	}

	// check argument type
	if ( args->arg_count && args->arg_types[0]!=SPH_UDF_TYPE_UINT32 )
    {
		snprintf ( error_message, SPH_UDF_ERROR_LEN, "SEQUENCE() requires 1st argument to be uint" );
		return 1;
	}

	// allocate and init counter storage
	init->func_data = (void*) malloc ( sizeof(int) );
	if ( !init->func_data )
	{
		snprintf ( error_message, SPH_UDF_ERROR_LEN, "malloc() failed" );
		return 1;
	}
	*(int*)init->func_data = 1;

	// all done
	return 0;
}


/// UDF deinitialization
/// gets called on every query, when query ends
DLLEXPORT void sequence_deinit ( SPH_UDF_INIT * init )
{
	// deallocate storage
	if ( init->func_data )
	{
		free ( init->func_data );
		init->func_data = NULL;
	}
}


/// UDF implementation
/// gets called for every row, unless optimized away
DLLEXPORT sphinx_int64_t sequence ( SPH_UDF_INIT * init, SPH_UDF_ARGS * args, char * error_message )
{
	int res = (*(int*)init->func_data)++;
	if ( args->arg_count )
		res += *(int*)args->arg_values[0];
	return res;
}

//////////////////////////////////////////////////////////////////////////

DLLEXPORT int strtoint_init ( SPH_UDF_INIT * init, SPH_UDF_ARGS * args, char * error_message )
{
	if ( args->arg_count!=1 || args->arg_types[0]!=SPH_UDF_TYPE_STRING )
	{
		snprintf ( error_message, SPH_UDF_ERROR_LEN, "STRTOINT() requires 1 string argument" );
		return 1;
	}
	return 0;
}

DLLEXPORT sphinx_int64_t strtoint ( SPH_UDF_INIT * init, SPH_UDF_ARGS * args, char * error_message )
{
	const char * s = args->arg_values[0];
	int len = args->str_lengths[0], res = 0;

	while ( len>0 && *s>='0' && *s<='9' )
	{
		res += *s - '0';
		len--;
	}

	return res;
}

//////////////////////////////////////////////////////////////////////////

DLLEXPORT int avgmva_init ( SPH_UDF_INIT * init, SPH_UDF_ARGS * args, char * error_message )
{
	if ( args->arg_count!=1 ||
		( args->arg_types[0]!=SPH_UDF_TYPE_UINT32SET && args->arg_types[0]!=SPH_UDF_TYPE_INT64SET ) )
	{
		snprintf ( error_message, SPH_UDF_ERROR_LEN, "AVGMVA() requires 1 MVA argument" );
		return 1;
	}

	// store our mva vs mva64 flag to func_data
	init->func_data = (void*)(int)( args->arg_types[0]==SPH_UDF_TYPE_INT64SET ? 1 : 0 );
	return 0;
}

DLLEXPORT double avgmva ( SPH_UDF_INIT * init, SPH_UDF_ARGS * args, char * error_message )
{
	unsigned int * mva = (unsigned int *) args->arg_values[0];
	double res = 0;
	int i, n, is64;

	if ( !mva )
		return res;

	// Both MVA32 and MVA64 are stored as dword (unsigned 32-bit) arrays.
	// The first dword stores the array length (always in dwords too), and
	// the next ones store the values. In pseudocode:
	//
	// unsigned int num_dwords
	// unsigned int data [ num_dwords ]
	//
	// With MVA32, this lets you access the values pretty naturally.
	//
	// With MVA64, however, we have to do a few tricks:
	// a) divide num_dwords by 2 to get the number of 64-bit elements,
	// b) assemble those 64-bit values from dword pairs.
	//
	// The latter is required for architectures where non-aligned
	// 64-bit access crashes. On Intel, we could have also done it
	// like this:
	//
	// int * raw_ptr = (int*) args->arg_values[0];
	// int mva64_count = (*raw_ptr) / 2;
	// sphinx_uint64_t * mva64_values = (sphinx_uint64_t*)(raw_ptr + 1);

	// pull "mva32 or mva64" flag (that we stored in _init) from func_data
	is64 = (int)(init->func_data) != 0;
	if ( is64 )
	{
		// handle mva64
		n = *mva++ / 2;
		for ( i=0; i<n; i++ )
		{
			res += (((sphinx_uint64_t)mva[1]) << 32) + mva[0];
			mva += 2;
		}
	} else
	{
		// handle mva32
		n = *mva++;
		for ( i=0; i<n; i++ )
			res += *mva++;
	}

	return res/n;
}

//////////////////////////////////////////////////////////////////////////

DLLEXPORT int failtest_init ( SPH_UDF_INIT * init, SPH_UDF_ARGS * args, char * error_message )
{
	if ( args->arg_count != 0 )
	{
		snprintf ( error_message, SPH_UDF_ERROR_LEN, "FAILTEST() takes 0 arguments" );
		return 1;
	}

	// allocate counter storage, init counter
	init->func_data = (void*) malloc ( sizeof(int) );
	if ( !init->func_data )
	{
		snprintf ( error_message, SPH_UDF_ERROR_LEN, "malloc() failed" );
		return 1;
	}
	*(int*)init->func_data = 1;

	return 0;
}

DLLEXPORT char * failtest ( SPH_UDF_INIT * init, SPH_UDF_ARGS * args, char * error_message )
{
	int a = (*(int*)init->func_data)++;

	if ( a < 4 )
	{
		// IMPORTANT!
		// note that strings we return to Sphinx MUST be allocated using fn_malloc!
		char * res = args->fn_malloc ( 16 );
		snprintf ( res, 16, "val%d", a );
		return res;
	}

	// starting with UDF version 12, we can emit an error message from the main
	// UDF function too, and not just a 1-byte flag
	snprintf ( error_message, SPH_UDF_ERROR_LEN, "err%d", a );
	return NULL;
}

DLLEXPORT void failtest_deinit ( SPH_UDF_INIT * init )
{
	// deallocate storage
	if ( init->func_data )
	{
		free ( init->func_data );
		init->func_data = NULL;
	}
}

// FIXME! add a ranker plugin example?

//
// $Id$
//
